-- Ensure settings table has proper structure and constraints
-- Add unique constraint on key column if it doesn't exist
DO $$
BEGIN
    -- Add unique constraint on key column
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'settings_key_unique'
    ) THEN
        ALTER TABLE public.settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
    END IF;
END $$;

-- Insert default settings if they don't exist
INSERT INTO public.settings (key, value, description) 
VALUES 
    ('app', '{"company_name": "", "support_email": "", "support_phone": ""}', 'Application settings'),
    ('smtp', '{"host": "", "port": 587, "username": "", "password": "", "from_email": "", "from_name": ""}', 'SMTP email settings'),
    ('payment', '{"stripe_publishable_key": "", "stripe_secret_key": "", "test_mode": true}', 'Payment gateway settings'),
    ('telegram', '{"bot_token": "", "info_chat_id": "", "form_chat_id": ""}', 'Telegram bot settings')
ON CONFLICT (key) DO NOTHING;