const express = require("express");
const router = express.Router();
const qrcode = require("qrcode");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

// All assignment routes require teacher authentication
router.use(authMiddleware);

// ─── POST /api/assignments ───────────────────────────────────────────────────
// Create a new assignment with full context
router.post("/", async (req, res) => {
  const {
    collegeName,
    department,
    subject,
    subjectCode,
    title,
    instructions,
    questions,
    maxMarks,
    dueDate,
    allowLateSubmission,
    allowedFileTypes,
  } = req.body;

  if (!subject || !title || !questions) {
    return res.status(400).json({
      message: "Subject name, assignment title, and questions are mandatory.",
    });
  }

  try {
    const teacherId = req.teacher.id;
    const teacherName = req.teacher.name;
    const institute = collegeName || req.teacher.collegeName || "Institute";

    // 1. Insert assignment record into Supabase
    const { data: assignment, error: insertError } = await supabase
      .from("assignments")
      .insert([
        {
          teacher_id: teacherId,
          teacher_name: teacherName,
          college_name: institute.trim(),
          department: (department || "").trim(),
          subject: subject.trim(),
          subject_code: (subjectCode || "").trim(),
          title: title.trim(),
          instructions: (instructions || "").trim(),
          questions: questions.trim(),
          max_marks: Number(maxMarks) || 100,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          allow_late_submission: allowLateSubmission !== false,
          allowed_file_types: (allowedFileTypes || "pdf").toLowerCase().trim(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        message: "Failed to create assignment in database.",
        error: insertError.message,
      });
    }

    // 2. Build absolute shareable URL (always public https/http link)
    const clientBase = (
      process.env.CLIENT_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");
    const shareableLink = `${clientBase}/submit/${assignment.id}`;

    // Update assignment with its permanent shareable link
    await supabase
      .from("assignments")
      .update({ shareable_link: shareableLink })
      .eq("id", assignment.id);

    // 3. Generate QR code (base64 Data URL) encoding the shareable link
    const qrCode = await qrcode.toDataURL(shareableLink, {
      width: 280,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
    });

    res.status(201).json({
      message: "Assignment created successfully!",
      assignment: { ...assignment, shareable_link: shareableLink },
      shareableLink,
      qrCode,
    });
  } catch (err) {
    console.error("Create assignment error:", err);
    res
      .status(500)
      .json({
        message: "Server error creating assignment.",
        error: err.message,
      });
  }
});

// ─── GET /api/assignments ─────────────────────────────────────────────────────
// List all assignments created by the logged-in teacher with submission counts
router.get("/", async (req, res) => {
  try {
    const teacherId = req.teacher.id;

    // Auto-cleanup: permanently remove soft-deleted assignments older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("assignments")
      .delete()
      .eq("teacher_id", teacherId)
      .eq("is_deleted", true)
      .lt("deleted_at", threeDaysAgo);

    // Fetch assignments owned by this teacher
    const { data: assignments, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching assignments.", error: error.message });
    }

    // Attach submission counts
    const assignmentsWithCount = await Promise.all(
      assignments.map(async (asgn) => {
        const { count, error: countErr } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", asgn.id);

        return {
          ...asgn,
          submissionCount: countErr ? 0 : count || 0,
        };
      }),
    );

    res.json(assignmentsWithCount);
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────
// Get assignment details + all student submissions for teacher view
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id;

    // Fetch assignment
    const { data: assignment, error: asgnError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (asgnError || !assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or unauthorized." });
    }

    // Fetch all submissions for this assignment
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", id)
      .order("submitted_at", { ascending: false });

    if (subError) {
      return res
        .status(500)
        .json({
          message: "Error fetching submissions.",
          error: subError.message,
        });
    }

    // Re-generate QR code for display
    const shareableLink =
      assignment.shareable_link ||
      `${(process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "")}/submit/${assignment.id}`;

    const qrCode = await qrcode.toDataURL(shareableLink, {
      width: 250,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });

    res.json({
      assignment: { ...assignment, shareable_link: shareableLink },
      shareableLink,
      submissions: submissions || [],
      qrCode,
    });
  } catch (err) {
    console.error("Fetch assignment detail error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── DELETE /api/assignments/:id ──────────────────────────────────────────────
// Soft delete an assignment: retains data for 3 days recovery, blocks submissions immediately
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id;

    // Verify ownership
    const { data: assignment, error: findError } = await supabase
      .from("assignments")
      .select("id, is_deleted")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (findError || !assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or unauthorized." });
    }

    // Mark as deleted with timestamp
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("assignments")
      .update({
        is_deleted: true,
        deleted_at: now,
      })
      .eq("id", id);

    if (updateError) {
      return res
        .status(500)
        .json({ message: "Failed to delete assignment.", error: updateError.message });
    }

    res.json({
      message: "Assignment moved to trash. You can recover it within 3 days.",
      deletedAt: now,
    });
  } catch (err) {
    console.error("Delete assignment error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── PATCH /api/assignments/:id/restore ───────────────────────────────────────
// Restore a soft-deleted assignment within the 3-day recovery window
router.patch("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id;

    // Verify ownership and check 3-day window
    const { data: assignment, error: findError } = await supabase
      .from("assignments")
      .select("id, is_deleted, deleted_at")
      .eq("id", id)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (findError || !assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or unauthorized." });
    }

    if (!assignment.is_deleted) {
      return res
        .status(400)
        .json({ message: "Assignment is not in trash." });
    }

    // Check if 3 days (72 hours) have passed
    if (assignment.deleted_at) {
      const deletedTime = new Date(assignment.deleted_at).getTime();
      const nowTime = Date.now();
      const diffDays = (nowTime - deletedTime) / (1000 * 60 * 60 * 24);

      if (diffDays > 3) {
        return res.status(400).json({
          message:
            "3-day recovery window has expired. This assignment cannot be restored.",
        });
      }
    }

    // Restore assignment
    const { error: restoreError } = await supabase
      .from("assignments")
      .update({
        is_deleted: false,
        deleted_at: null,
      })
      .eq("id", id);

    if (restoreError) {
      return res
        .status(500)
        .json({ message: "Failed to restore assignment.", error: restoreError.message });
    }

    res.json({
      message: "Assignment restored successfully! Submissions are active again.",
    });
  } catch (err) {
    console.error("Restore assignment error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
