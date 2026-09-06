const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");
const {
  extractTextFromFile,
  cleanExtractedText,
  gradeWithAzureOpenAI,
  detectAIContent,
} = require("../services/aiService");

// Use Multer memory storage to receive file buffer in memory
// This allows uploading directly to Supabase Storage and extracting text without saving temp files on disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isAllowed =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/x-pdf" ||
      file.mimetype.includes("wordprocessingml") ||
      file.originalname.toLowerCase().endsWith(".pdf") ||
      file.originalname.toLowerCase().endsWith(".docx");

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF and DOCX files are allowed."),
        false,
      );
    }
  },
});

// ─── GET /api/submissions/assignment/:assignmentId ────────────────────────────
// Public route: Student opens this to view the full assignment context
router.get("/assignment/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(
        "id, college_name, department, teacher_name, subject, subject_code, title, instructions, questions, max_marks, due_date, allow_late_submission, allowed_file_types, is_deleted",
      )
      .eq("id", assignmentId)
      .maybeSingle();

    if (error || !assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or link is invalid." });
    }

    if (assignment.is_deleted) {
      return res
        .status(410)
        .json({ message: "This assignment has been temporarily disabled or moved to trash by the faculty." });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Fetch student assignment error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── POST /api/submissions/:assignmentId ──────────────────────────────────────
// Public route: Student uploads assignment file
// Handles Phase 1 upload + overwrite + Phase 2 AI grading + Phase 3 AI detection
router.post("/:assignmentId", upload.single("file"), async (req, res) => {
  const { assignmentId } = req.params;
  const { studentName, rollNumber } = req.body;
  const file = req.file;

  if (!studentName || !rollNumber) {
    return res
      .status(400)
      .json({ message: "Student Name and Roll Number are required." });
  }

  if (!file) {
    return res
      .status(400)
      .json({ message: "Please select a valid PDF or DOCX file." });
  }

  try {
    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanName = studentName.trim();

    // 1. Verify that assignment exists and check due date & deleted status
    const { data: assignment, error: asgnError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .maybeSingle();

    if (asgnError || !assignment) {
      return res.status(404).json({ message: "Assignment does not exist." });
    }

    // Check if assignment is deleted / in trash
    if (assignment.is_deleted) {
      return res.status(410).json({
        message: "This assignment has been deleted by the faculty. Submissions are closed.",
      });
    }

    // Check if late submissions are blocked after due date
    if (assignment.due_date && !assignment.allow_late_submission) {
      const now = new Date();
      const due = new Date(assignment.due_date);
      if (now > due) {
        return res.status(400).json({
          message:
            "The due date for this assignment has passed. Late submissions are closed.",
        });
      }
    }

    // 2. Upload file to Supabase Storage bucket ('submissions')
    const fileExt = file.originalname.split(".").pop() || "pdf";
    const sanitizedFilename = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    );
    const storagePath = `${assignmentId}/${cleanRoll}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return res.status(500).json({
        message: "Failed to upload file to storage.",
        error: uploadError.message,
      });
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(storagePath);

    const publicFileUrl = urlData?.publicUrl || "";

    // 3. Check for existing submission by same roll number (Overwrite rule)
    const { data: existingSubmission } = await supabase
      .from("submissions")
      .select("id, file_path")
      .eq("assignment_id", assignmentId)
      .eq("roll_number", cleanRoll)
      .maybeSingle();

    // If overwriting, remove old file from storage to keep bucket clean
    if (existingSubmission && existingSubmission.file_path) {
      try {
        await supabase.storage
          .from("submissions")
          .remove([existingSubmission.file_path]);
      } catch (e) {
        console.warn("Could not delete old storage file:", e.message);
      }
    }

    // 4. Run Phase 2 (AI Grading) & Phase 3 (AI Detection)
    // Extract text
    const extractedText = await extractTextFromFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );
    const cleanedText = cleanExtractedText(extractedText);

    let aiEstimatedMarks = null;
    let aiSummary = "No content extracted for evaluation.";
    let aiReasoning = "";
    let gradingStatus = "PENDING";
    let aiDetectionScore = null;
    let aiDetectionStatus = "SKIPPED";

    // Only process AI if cleaned text has sufficient substance (>100 characters)
    if (cleanedText.length >= 100) {
      // Phase 2: Call Azure OpenAI (gpt-5-mini)
      const gradeResult = await gradeWithAzureOpenAI({
        questions: assignment.questions,
        instructions: assignment.instructions,
        maxMarks: assignment.max_marks,
        subject: assignment.subject,
        title: assignment.title,
        studentText: cleanedText,
      });

      aiEstimatedMarks = gradeResult.estimatedMarks;
      aiSummary = gradeResult.summary;
      aiReasoning = gradeResult.reasoning;
      gradingStatus = gradeResult.status;

      // Phase 3: Call Sapling AI Detector (round-robin)
      const detectResult = await detectAIContent(cleanedText);
      aiDetectionScore = detectResult.score;
      aiDetectionStatus = detectResult.status;
    } else {
      aiSummary =
        "Document text is very short or could not be extracted directly.";
    }

    // 5. Save or Update submission record in Supabase
    let savedSubmission = null;
    const isOverwrite = !!existingSubmission;

    if (isOverwrite) {
      const { data: updated, error: updateErr } = await supabase
        .from("submissions")
        .update({
          student_name: cleanName,
          file_url: publicFileUrl,
          file_path: storagePath,
          submitted_at: new Date().toISOString(),
          ai_estimated_marks: aiEstimatedMarks,
          ai_summary: aiSummary,
          ai_reasoning: aiReasoning,
          teacher_final_marks: null, // Reset teacher mark on resubmit
          grading_status: gradingStatus,
          ai_detection_score: aiDetectionScore,
          ai_detection_status: aiDetectionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id)
        .select()
        .single();

      if (updateErr) {
        return res
          .status(500)
          .json({
            message: "Failed to update submission in database.",
            error: updateErr.message,
          });
      }
      savedSubmission = updated;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("submissions")
        .insert([
          {
            assignment_id: assignmentId,
            student_name: cleanName,
            roll_number: cleanRoll,
            file_url: publicFileUrl,
            file_path: storagePath,
            submitted_at: new Date().toISOString(),
            ai_estimated_marks: aiEstimatedMarks,
            ai_summary: aiSummary,
            ai_reasoning: aiReasoning,
            teacher_final_marks: null,
            grading_status: gradingStatus,
            ai_detection_score: aiDetectionScore,
            ai_detection_status: aiDetectionStatus,
          },
        ])
        .select()
        .single();

      if (insertErr) {
        return res
          .status(500)
          .json({
            message: "Failed to save submission.",
            error: insertErr.message,
          });
      }
      savedSubmission = inserted;
    }

    res.status(200).json({
      message: isOverwrite
        ? "Submission updated successfully! Your previous file has been replaced."
        : "Submission successful! Your assignment has been recorded.",
      isOverwrite,
      submission: {
        id: savedSubmission.id,
        studentName: savedSubmission.student_name,
        rollNumber: savedSubmission.roll_number,
        fileUrl: savedSubmission.file_url,
        aiDetectionScore: savedSubmission.ai_detection_score,
      },
    });
  } catch (err) {
    console.error("Submission processing error:", err);
    res
      .status(500)
      .json({
        message: "Server error processing submission.",
        error: err.message,
      });
  }
});

// ─── PATCH /api/submissions/:id/grade ─────────────────────────────────────────
// Teacher approves or overrides the AI estimated grade
router.patch("/:id/grade", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { teacherFinalMarks } = req.body;

  if (
    teacherFinalMarks === undefined ||
    teacherFinalMarks === null ||
    isNaN(Number(teacherFinalMarks))
  ) {
    return res
      .status(400)
      .json({ message: "A valid numeric grade is required." });
  }

  try {
    const finalMarks = Number(teacherFinalMarks);

    const { data: submission, error } = await supabase
      .from("submissions")
      .update({
        teacher_final_marks: finalMarks,
        grading_status: "TEACHER_APPROVED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !submission) {
      return res
        .status(500)
        .json({ message: "Failed to update grade.", error: error?.message });
    }

    res.json({
      message: "Grade saved and approved successfully!",
      submission,
    });
  } catch (err) {
    console.error("Grade update error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
