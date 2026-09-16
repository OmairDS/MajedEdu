-- Run once in a NEW Neon database. No users, names, emails or uploaded files.
BEGIN;
CREATE TABLE IF NOT EXISTS quizzes (
 id uuid PRIMARY KEY,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 100),
 questions jsonb NOT NULL CHECK(jsonb_typeof(questions)='array' AND jsonb_array_length(questions) BETWEEN 1 AND 20),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS attempts (
 id uuid PRIMARY KEY,
 quiz_id uuid NOT NULL REFERENCES quizzes(id),
 answers jsonb NOT NULL CHECK(jsonb_typeof(answers)='array'),
 score integer NOT NULL,
 total integer NOT NULL CHECK(total BETWEEN 1 AND 20),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(score BETWEEN 0 AND total),
 CHECK(jsonb_array_length(answers)=total)
);
CREATE INDEX IF NOT EXISTS attempts_recent ON attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS attempts_quiz ON attempts(quiz_id);
INSERT INTO quizzes(id,title,questions) VALUES (
 '11111111-1111-4111-8111-111111111111','الواجب الأول · أساسيات رقمية',
 '[{"text":"أي برنامج يُستخدم لإنشاء الجداول الحسابية؟","options":["Excel","الرسام","مشغّل الفيديو","الكاميرا"],"correct":0},{"text":"ما الخيار الأنسب لحماية الحساب؟","options":["مشاركة كلمة المرور","كلمة مرور قوية","استخدام الاسم فقط","ترك الحساب مفتوحاً"],"correct":1},{"text":"ما الامتداد الشائع للمستندات القابلة للطباعة؟","options":["MP3","JPG","PDF","MP4"],"correct":2}]'
) ON CONFLICT(id) DO NOTHING;
COMMIT;
