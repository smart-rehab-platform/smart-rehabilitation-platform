-- Session lifecycle notifications for specialist edit/cancel.
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'session_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'session_cancelled';
