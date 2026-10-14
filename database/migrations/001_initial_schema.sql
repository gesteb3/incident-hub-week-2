CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('REQUESTER', 'TECHNICIAN', 'ADMIN');
CREATE TYPE incident_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE incident_status AS ENUM ('NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO');
CREATE TYPE history_event_type AS ENUM ('CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'COMMENTED', 'UPDATED');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'REQUESTER',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL CHECK (length(trim(title)) >= 5),
  description TEXT NOT NULL CHECK (length(trim(description)) >= 10),
  priority incident_priority NOT NULL,
  status incident_status NOT NULL DEFAULT 'NUEVO',
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  CONSTRAINT incident_resolution_dates CHECK (
    (closed_at IS NULL OR resolved_at IS NOT NULL)
    AND (resolved_at IS NULL OR resolved_at >= created_at)
    AND (closed_at IS NULL OR closed_at >= resolved_at)
  )
);

CREATE TABLE incident_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type history_event_type NOT NULL,
  previous_status incident_status,
  new_status incident_status,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX incidents_status_idx ON incidents(status);
CREATE INDEX incidents_priority_idx ON incidents(priority);
CREATE INDEX incidents_category_id_idx ON incidents(category_id);
CREATE INDEX incidents_technician_id_idx ON incidents(technician_id);
CREATE INDEX incidents_created_at_idx ON incidents(created_at DESC);
CREATE INDEX incident_comments_incident_created_idx ON incident_comments(incident_id, created_at);
CREATE INDEX incident_history_incident_created_idx ON incident_history(incident_id, created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER incidents_set_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION create_incident_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO incident_history (incident_id, actor_id, event_type, new_status, details)
  VALUES (NEW.id, NEW.reporter_id, 'CREATED', NEW.status, jsonb_build_object('title', NEW.title));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_create_history
AFTER INSERT ON incidents
FOR EACH ROW EXECUTE FUNCTION create_incident_history();
