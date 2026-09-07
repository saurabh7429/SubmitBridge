-- =============================================================================
-- SubmitBridge Database Schema — 01_create_tables.sql
-- Compatible with PostgreSQL 14+ / Supabase PostgreSQL 17
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table: teachers
-- Stores faculty user profiles, institutions, and bcrypt password credentials
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    college_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Table: assignments
-- Stores coursework parameters, questions, deadlines, and link references
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    department TEXT,
    teacher_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    subject_code TEXT,
    title TEXT NOT NULL,
    instructions TEXT,
    questions TEXT NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    allow_late_submission BOOLEAN DEFAULT true,
    allowed_file_types TEXT DEFAULT 'pdf'::text,
    shareable_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- -----------------------------------------------------------------------------
-- Table: submissions
-- Stores student coursework submissions, file URLs, AI grading, and final grades
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_email TEXT,
    file_url TEXT NOT NULL,
    file_path TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ai_estimated_marks INTEGER,
    ai_summary TEXT,
    ai_reasoning TEXT,
    teacher_final_marks INTEGER,
    grading_status TEXT DEFAULT 'PENDING'::text,
    ai_detection_score NUMERIC,
    ai_detection_status TEXT DEFAULT 'SKIPPED'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_assignment_roll UNIQUE (assignment_id, roll_number)
);
