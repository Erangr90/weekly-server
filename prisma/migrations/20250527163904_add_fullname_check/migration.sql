-- validate user's fullName
ALTER TABLE "User"
ADD CONSTRAINT full_name_only_letters CHECK (
  char_length(trim("fullName")) BETWEEN 2 AND 50 AND
  "fullName" ~ '^[A-Za-z\u0590-\u05FF ]+$'
);
-- validate user's email
ALTER TABLE "User"
ADD CONSTRAINT email_format_valid CHECK (
  "email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);
