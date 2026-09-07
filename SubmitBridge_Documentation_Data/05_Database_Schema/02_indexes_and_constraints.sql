-- =============================================================================
-- SubmitBridge Database Schema — 02_indexes_and_constraints.sql
-- Optimizations, Foreign Keys, and Unique Constraints
-- =============================================================================

-- Indexes on foreign keys for fast joins and lookups
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id 
    ON public.assignments(teacher_id);

CREATE INDEX IF NOT EXISTS idx_assignments_is_deleted 
    ON public.assignments(is_deleted);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id 
    ON public.submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student_email 
    ON public.submissions(student_email);

CREATE INDEX IF NOT EXISTS idx_submissions_roll_number 
    ON public.submissions(roll_number);

CREATE INDEX IF NOT EXISTS idx_teachers_email 
    ON public.teachers(email);

-- Composite Unique Constraint to prevent multiple active rows for same roll number
-- (Already declared on table creation, reinforced here if migrating)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_assignment_roll'
    ) THEN
        ALTER TABLE public.submissions 
        ADD CONSTRAINT unique_assignment_roll UNIQUE (assignment_id, roll_number);
    END IF;
END $$;
