const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// ─── TEXT EXTRACTION & PREPROCESSING ──────────────────────────────────────────

const zlib = require("zlib");

/**
 * Fallback parser that decodes compressed streams (ASCII85/Flate) and extracts text
 * operators (Tj and TJ) when standard PDF parsers encounter syntax anomalies (e.g., ReportLab quirks).
 */
function extractPdfStreamsFallback(buffer) {
  try {
    const raw = buffer.toString("binary");
    let extracted = "";
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let match;

    while ((match = streamRegex.exec(raw)) !== null) {
      const rawStream = match[1];
      let uncompressed = null;

      // Attempt 1: Direct FlateDecode
      try {
        uncompressed = zlib.inflateSync(Buffer.from(rawStream, "binary"));
      } catch (e1) {
        // Attempt 2: ASCII85 + FlateDecode
        try {
          let s = rawStream.replace(/\s+/g, "");
          if (s.endsWith("~>")) s = s.slice(0, -2);
          if (s.startsWith("<~")) s = s.slice(2);
          const bytes = [];
          for (let i = 0; i < s.length; i += 5) {
            const chunk = s.slice(i, i + 5);
            if (chunk === "z") {
              bytes.push(0, 0, 0, 0);
              i -= 4;
              continue;
            }
            const pad = 5 - chunk.length;
            const padded = chunk + "u".repeat(pad);
            let val = 0;
            for (let j = 0; j < 5; j++) {
              val = val * 85 + (padded.charCodeAt(j) - 33);
            }
            for (let k = 0; k < 4 - pad; k++) {
              bytes.push((val >>> (24 - k * 8)) & 255);
            }
          }
          uncompressed = zlib.inflateSync(Buffer.from(bytes));
        } catch (e2) {}
      }

      if (uncompressed) {
        const streamStr = uncompressed.toString("latin1");
        // Extract simple Tj strings: (text) Tj
        const tjRegex = /\((.*?)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(streamStr)) !== null) {
          extracted += tjMatch[1] + " ";
        }
        // Extract TJ array strings: [(text) -20 (more)] TJ
        const tjArrRegex = /\[(.*?)\]\s*TJ/g;
        let arrMatch;
        while ((arrMatch = tjArrRegex.exec(streamStr)) !== null) {
          const innerMatches = arrMatch[1].match(/\((.*?)\)/g);
          if (innerMatches) {
            innerMatches.forEach((m) => {
              extracted += m.slice(1, -1) + " ";
            });
          }
        }
      }
    }

    // Attempt 3: If still empty, scan raw ASCII string literals in the PDF body
    if (!extracted.trim()) {
      const literalMatches = raw.match(/\(([^()]{3,})\)/g);
      if (literalMatches) {
        extracted = literalMatches
          .map((m) => m.slice(1, -1))
          .filter((t) => !t.startsWith("ReportLab") && !t.startsWith("D:20"))
          .join(" ");
      }
    }

    return extracted.replace(/\\([()\\])/g, "$1").trim();
  } catch (err) {
    console.warn("Fallback PDF extraction error:", err.message);
    return "";
  }
}

/**
 * Extracts raw text from uploaded PDF or DOCX file buffer.
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {string} mimetype - MIME type of the uploaded file
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromFile(buffer, mimetype, filename = "") {
  try {
    const isDocx =
      mimetype.includes("wordprocessingml") ||
      mimetype.includes("msword") ||
      filename.toLowerCase().endsWith(".docx");

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    // Default to PDF parsing
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
        return pdfData.text;
      }
    } catch (parseErr) {
      console.warn("pdf-parse encountered an error, trying stream fallback:", parseErr.message);
    }

    // Use fallback stream extractor for PDFs with parser anomalies
    const fallbackText = extractPdfStreamsFallback(buffer);
    return fallbackText || "";
  } catch (err) {
    console.error("Error extracting text from file:", err.message);
    return "";
  }
}

/**
 * Cleans and preprocesses extracted text to save API quota and remove noise.
 * - Strips common header labels (Name, Roll No, etc.)
 * - Normalizes excessive whitespace
 * - Truncates to ~4000 characters
 * @param {string} rawText
 * @returns {string} Cleaned text
 */
function cleanExtractedText(rawText) {
  if (!rawText) return "";

  let text = rawText
    // Remove common metadata labels
    .replace(/(Name|Roll\s*No|RollNumber|Date|Page\s*\d+)\s*:[^\n]+/gi, "")
    // Normalize newlines and spaces
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  // Truncate to ~4000 characters
  if (text.length > 4000) {
    text = text.substring(0, 4000);
  }

  return text;
}

// ─── PHASE 2: AZURE OPENAI GRADING (gpt-5-mini) ───────────────────────────────

/**
 * Calls Azure OpenAI Service (gpt-5-mini) to produce an estimated mark and short summary.
 * AI estimation is only an assistive suggestion — the teacher has the final say.
 * @param {Object} params - { questions, instructions, maxMarks, subject, title, studentText }
 * @returns {Promise<Object>} { estimatedMarks, summary, reasoning }
 */
async function gradeWithAzureOpenAI({
  questions,
  instructions,
  maxMarks,
  subject,
  title,
  studentText,
}) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-5-mini";

  if (!endpoint || !apiKey) {
    console.warn(
      "⚠️ Azure OpenAI credentials not configured. Skipping AI grading.",
    );
    return {
      estimatedMarks: null,
      summary: "AI grading not configured on server.",
      reasoning: "Missing Azure OpenAI API credentials.",
      status: "SKIPPED",
    };
  }

  // Ensure endpoint URL formatting
  const baseUrl = endpoint.replace(/\/+$/, "");
  const url = `${baseUrl}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  const systemPrompt = `You are an academic evaluation assistant for college assignments.
Your task is to review the student's submission in isolation based ONLY on the provided assignment questions and max marks.
Do NOT compare this submission to any other student.
Always output a valid JSON object matching this schema exactly:
{
  "estimatedMarks": <number between 0 and maxMarks>,
  "summary": "<2-3 sentence concise summary of the student's work>",
  "reasoning": "<1-2 sentence brief justification for the estimated score>"
}`;

  const userPrompt = `Subject: ${subject}
Assignment Title: ${title}
Instructions: ${instructions || "None"}
Questions:
${questions}
Maximum Marks: ${maxMarks}

Student's Submitted Content:
${studentText}

Evaluate and provide the JSON assessment:`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure OpenAI error response:", errorText);
      return {
        estimatedMarks: null,
        summary: "AI grading service error.",
        reasoning: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
        status: "FAILED",
      };
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);

    // Bound estimatedMarks within 0 and maxMarks
    let marks = parsed.estimatedMarks;
    if (typeof marks === "number") {
      marks = Math.max(0, Math.min(maxMarks, Math.round(marks)));
    } else {
      marks = null;
    }

    return {
      estimatedMarks: marks,
      summary: parsed.summary || "Summary generated.",
      reasoning: parsed.reasoning || "Evaluation completed.",
      status: "AI_ESTIMATED",
    };
  } catch (err) {
    console.error("Error during Azure OpenAI grading:", err.message);
    return {
      estimatedMarks: null,
      summary: "AI grading evaluation failed.",
      reasoning: err.message,
      status: "FAILED",
    };
  }
}

// ─── PHASE 3: SAPLING AI CONTENT DETECTION (ROUND-ROBIN) ──────────────────────

// Pointer for round-robin rotation across multiple free-tier Sapling keys
let saplingKeyIndex = 0;

/**
 * Detects likelihood of AI-generated content using Sapling AI Detector API.
 * Uses a simple round-robin rotation across SAPLING_API_KEYS=key1,key2,key3.
 * Returns score (0-100%) and status without ever blocking a submission.
 * @param {string} text - Cleaned student text
 * @returns {Promise<Object>} { score, status }
 */
async function detectAIContent(text) {
  const rawKeys = process.env.SAPLING_API_KEYS || "";
  const keys = rawKeys
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (keys.length === 0) {
    return { score: null, status: "SKIPPED" };
  }

  // Attempt each key in round-robin order
  const totalKeys = keys.length;
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const currentKey = keys[(saplingKeyIndex + attempt) % totalKeys];

    try {
      const response = await fetch("https://api.sapling.ai/api/v1/aidetect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: currentKey,
          text: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Advance round-robin pointer for next submission
        saplingKeyIndex = (saplingKeyIndex + 1) % totalKeys;

        // Sapling returns score between 0 and 1
        const rawScore = typeof data.score === "number" ? data.score : 0;
        const scorePercentage = Math.round(rawScore * 100);

        return { score: scorePercentage, status: "COMPLETED" };
      }
    } catch (err) {
      console.warn(`Sapling key attempt ${attempt + 1} failed:`, err.message);
    }
  }

  // If all keys fail (e.g. quota exhausted), return safe fallback
  return { score: null, status: "FAILED" };
}

module.exports = {
  extractTextFromFile,
  cleanExtractedText,
  gradeWithAzureOpenAI,
  detectAIContent,
};
