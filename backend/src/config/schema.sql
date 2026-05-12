CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id     VARCHAR(255) UNIQUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           VARCHAR(150) NOT NULL,
  description    TEXT NOT NULL,
  stack_tags     JSONB DEFAULT '[]',
  roles_needed   JSONB DEFAULT '[]',
  commitment     VARCHAR(20) CHECK (commitment IN ('Casual', 'Part-time', 'Serious')),
  is_open        BOOLEAN DEFAULT TRUE,
  screenshot_url VARCHAR(500),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  github_url  VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);