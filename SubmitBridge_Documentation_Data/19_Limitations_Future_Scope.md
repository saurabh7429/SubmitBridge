# 19. Project Limitations & Future Scope — SubmitBridge

This document outlines the architectural boundaries and operational limitations of the current implementation of **SubmitBridge**, alongside a structured, phased roadmap for future enhancements.

---

## 1. Current System Limitations

1. **Non-Searchable & Handwritten PDF Documents:**
   - Text extraction currently relies on digital text layers within PDFs (`pdf-parse`) and Word documents (`mammoth`).
   - If a student uploads a scanned image PDF or a photo of handwritten notebook pages without an optical character recognition (OCR) layer, minimal or zero text is extracted. In such instances, the system flags the text as short and bypasses automated AI evaluation.

2. **Single Document per Submission:**
   - The submission schema currently permits exactly one document (PDF or DOCX) per student submission. Coursework requiring separate source code archives (`.zip`), datasets (`.csv`), or multiple presentation decks cannot be submitted together in one transaction.

3. **Isolated AI Evaluation (No Cross-Student Plagiarism Comparison):**
   - In accordance with privacy and isolated grading prompts, Azure OpenAI evaluates each student's submission in isolation against the assignment questions.
   - The platform does not currently perform intra-class text diffing or cluster analysis to detect collusion between classmates.

4. **10MB Upload Limit:**
   - To ensure fast in-memory Multer buffering and prevent memory exhaustion on cloud container tiers, individual document uploads are strictly capped at 10MB. High-resolution scanned documents exceeding 10MB are rejected.

5. **Asynchronous Feedback Delivery:**
   - Although grades and justifications are permanently recorded in Supabase, the system does not currently dispatch automated outbound emails notifying students when their faculty member approves or overrides their final mark.

6. **Free-Tier Host Cold Starts:**
   - When hosted on Render's free tier, the backend web service spins down after periods of inactivity, resulting in a 30 to 50-second latency delay on the initial request.

---

## 2. Structured Future Development Roadmap

### Phase 2: Enhanced Academic Ingestion & Optical Recognition
- **Cloud OCR Integration (Tesseract / Azure Vision):** Implement automated optical character recognition pipelines to convert scanned handwritten notebook assignments into machine-readable text for AI grading.
- **Multi-File Submissions:** Extend the database schema and storage structure to support multiple attachments (e.g., PDF report + ZIP code package).
- **Automated Grade Notification Emails:** Leverage the existing Resend service to dispatch an automated email to the student's verified Google address as soon as the teacher approves their final grade.
- **In-Browser Document Annotation:** Provide teachers with an embedded PDF viewer capable of highlighting text, drawing red ink feedback, and placing margin comments directly onto student PDFs.

### Phase 3: Institutional Governance & Academic Integrity
- **Intra-Class Similarity & Plagiarism Matrix:** Implement vector embeddings (via OpenAI `text-embedding-3-small` or pgvector in Supabase) to calculate cosine similarity across all submissions in the same classroom, generating an intra-class collusion similarity matrix.
- **Institutional Single Sign-On (SSO):** Integrate Google Workspace domain restrictions and SAML 2.0 to restrict student submissions strictly to institutional email addresses (e.g., `@college.edu.in`).
- **Student Performance Analytics:** Build a student portal view where students can view their cumulative grade trends, historical feedback, and subject-wise completion rates across semesters.
- **LMS Integration Webhooks:** Provide export webhooks and LTI (Learning Tools Interoperability) support to synchronize assignments and grades with Moodle, Google Classroom, and Canvas.
