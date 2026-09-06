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
CRITICAL CONSTRAINT: The maximum possible mark for this assignment is ${maxMarks}. You MUST NEVER award more than ${maxMarks} marks under any circumstance.
Always output a valid JSON object matching this schema exactly:
{
  "estimatedMarks": <number between 0 and ${maxMarks}>,
  "summary": "<2-3 sentence concise summary of the student's work>",
  "reasoning": "<1-2 sentence brief justification for the estimated score>"
}`;

  const userPrompt = `Subject: ${subject}
Assignment Title: ${title}
Instructions: ${instructions || "None"}
Questions:
${questions}
Maximum Marks: ${maxMarks} (Strict limit: 0 to ${maxMarks})

Student's Submitted Content:
${studentText}

Evaluate and provide the JSON assessment. Ensure estimatedMarks is between 0 and ${maxMarks}:`;

  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        console.error(`Azure OpenAI attempt ${attempt} failed:`, errorText);
        lastError = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
        continue;
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawContent);

      let marks = parsed.estimatedMarks;

      // Validate marks from AI response
      if (typeof marks === "number" && !isNaN(marks)) {
        // If AI hallucinated a mark greater than maxMarks or less than 0, retry
        if ((marks > maxMarks || marks < 0) && attempt < maxRetries) {
          console.warn(
            `⚠️ AI awarded ${marks} which exceeds maxMarks (${maxMarks}). Re-prompting AI (attempt ${attempt + 1})...`
          );
          continue;
        }

        // Hard boundary protection (never exceeds maxMarks or falls below 0)
        marks = Math.max(0, Math.min(Number(maxMarks), Math.round(marks)));

        return {
          estimatedMarks: marks,
          summary: parsed.summary || "Summary generated.",
          reasoning: parsed.reasoning || "Evaluation completed.",
          status: "AI_ESTIMATED",
        };
      } else if (attempt < maxRetries) {
        console.warn(`⚠️ AI returned non-numeric marks (${marks}). Retrying...`);
        continue;
      }
    } catch (err) {
      console.error(`Error during Azure OpenAI attempt ${attempt}:`, err.message);
      lastError = err.message;
    }
  }

  return {
    estimatedMarks: null,
    summary: "AI grading evaluation failed.",
    reasoning: lastError || "Failed after retries.",
    status: "FAILED",
  };
}

// ─── PHASE 3: SAPLING AI CONTENT DETECTION (ROUND-ROBIN) ──────────────────────

// Pointer for round-robin rotation across multiple free-tier Sapling keys
let saplingKeyIndex = 0;

/**
 * Helper to retrieve all configured Sapling keys from environment.
 * Supports both comma-separated SAPLING_API_KEYS and individual SAPLING_API_KEY1/2/3.
 * Automatically cleans any trailing inline comments (e.g., "#...") and whitespace.
 */
function getSaplingApiKeys() {
  const keys = [];

  if (process.env.SAPLING_API_KEYS) {
    process.env.SAPLING_API_KEYS.split(",").forEach((k) => {
      const clean = k.split("#")[0].trim();
      if (clean) keys.push(clean);
    });
  }

  // Also check individual keys SAPLING_API_KEY1, SAPLING_API_KEY2, ...
  for (let i = 1; i <= 10; i++) {
    const keyVal = process.env[`SAPLING_API_KEY${i}`];
    if (keyVal) {
      const clean = keyVal.split("#")[0].trim();
      if (clean && !keys.includes(clean)) {
        keys.push(clean);
      }
    }
  }

  return keys;
}

/**
 * Detects likelihood of AI-generated content using Sapling AI Detector API.
 * Uses a strict round-robin rotation: key1 -> key2 -> key3 -> key1.
 * If a key fails (e.g. rate limit/quota), falls back to the next key within the same request.
 * Returns score (0-100%) and status without ever blocking a student's submission.
 * @param {string} text - Cleaned student text
 * @returns {Promise<Object>} { score, status }
 */
async function detectAIContent(text) {
  const keys = getSaplingApiKeys();

  if (keys.length === 0) {
    console.warn("⚠️ No Sapling API keys configured. Skipping AI detection.");
    return { score: null, status: "SKIPPED" };
  }

  const totalKeys = keys.length;
  const startKeyIndex = saplingKeyIndex % totalKeys;

  // Attempt each key in round-robin sequence starting from current pointer
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const activeIndex = (startKeyIndex + attempt) % totalKeys;
    const currentKey = keys[activeIndex];

    try {
      console.log(
        `🔍 Running Sapling AI detection using Key #${activeIndex + 1} (attempt ${attempt + 1}/${totalKeys})...`
      );

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
        // Advance round-robin pointer to the NEXT key for subsequent submissions:
        // key1 -> key2 -> key3 -> key1
        saplingKeyIndex = (activeIndex + 1) % totalKeys;

        // Sapling returns score between 0 and 1
        const rawScore = typeof data.score === "number" ? data.score : 0;
        const scorePercentage = Math.round(rawScore * 100);

        console.log(
          `✅ Sapling detection successful on Key #${activeIndex + 1}. Score: ${scorePercentage}%. Next key index: #${saplingKeyIndex + 1}`
        );

        return { score: scorePercentage, status: "COMPLETED" };
      } else {
        const errBody = await response.text();
        console.warn(
          `⚠️ Sapling Key #${activeIndex + 1} failed with HTTP ${response.status}: ${errBody.substring(0, 100)}`
        );
      }
    } catch (err) {
      console.warn(`Sapling key #${activeIndex + 1} request error:`, err.message);
    }
  }

  // Advance pointer even on failure to avoid getting stuck on an exhausted key
  saplingKeyIndex = (saplingKeyIndex + 1) % totalKeys;

  // If all keys fail (e.g. quota exhausted across all free accounts), return safe fallback
  return { score: null, status: "FAILED" };
}

module.exports = {
  extractTextFromFile,
  cleanExtractedText,
  gradeWithAzureOpenAI,
  detectAIContent,
};
