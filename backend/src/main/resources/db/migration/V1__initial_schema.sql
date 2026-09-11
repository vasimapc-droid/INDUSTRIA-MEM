CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50),
    phone VARCHAR(30),
    department_id BIGINT REFERENCES departments(id),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE machines (
    id BIGSERIAL PRIMARY KEY,
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    machine_type VARCHAR(100),
    department_id BIGINT REFERENCES departments(id),
    production_line VARCHAR(100),
    status VARCHAR(30) DEFAULT 'OPERATIONAL',
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    location VARCHAR(200),
    description TEXT,
    qr_code_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE machine_history (
    id BIGSERIAL PRIMARY KEY,
    machine_id BIGINT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by BIGINT REFERENCES users(id),
    event_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    symptoms TEXT,
    machine_id BIGINT REFERENCES machines(id),
    department_id BIGINT REFERENCES departments(id),
    production_line VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    reported_by BIGINT NOT NULL REFERENCES users(id),
    assigned_to BIGINT REFERENCES users(id),
    incident_date TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    troubleshooting_performed TEXT,
    root_cause TEXT,
    solution TEXT,
    additional_notes TEXT,
    photo_urls TEXT,
    voice_url VARCHAR(500),
    transcript TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(30) DEFAULT 'AI_GENERATED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE knowledge_entries (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT REFERENCES incidents(id) ON DELETE SET NULL,
    machine_id BIGINT REFERENCES machines(id),
    title VARCHAR(255) NOT NULL,
    problem TEXT,
    symptoms TEXT,
    possible_cause TEXT,
    root_cause TEXT,
    troubleshooting_steps TEXT,
    solution TEXT,
    safety_notes TEXT,
    parts_components TEXT,
    severity VARCHAR(20),
    category VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'AI_GENERATED',
    submitted_by BIGINT NOT NULL REFERENCES users(id),
    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMP,
    expert_comment TEXT,
    helpful_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE knowledge_tags (
    knowledge_id BIGINT NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (knowledge_id, tag_id)
);

CREATE TABLE expert_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    years_experience INT,
    specialties TEXT,
    skills TEXT,
    certifications TEXT,
    bio TEXT,
    available BOOLEAN DEFAULT TRUE,
    contribution_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expert_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id),
    expert_id BIGINT REFERENCES users(id),
    incident_id BIGINT REFERENCES incidents(id),
    machine_id BIGINT REFERENCES machines(id),
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    response TEXT,
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

CREATE TABLE incident_comments (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_id BIGINT NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, knowledge_id)
);

CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_id BIGINT NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, knowledge_id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incidents_machine ON incidents(machine_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_knowledge_machine ON knowledge_entries(machine_id);
CREATE INDEX idx_knowledge_status ON knowledge_entries(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
