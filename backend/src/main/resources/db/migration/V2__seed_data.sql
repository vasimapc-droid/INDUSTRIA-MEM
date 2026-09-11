INSERT INTO roles (name, description) VALUES
('TECHNICIAN', 'Shop floor technician'),
('EXPERT', 'Senior engineer / expert'),
('ADMIN', 'Plant manager / administrator');

INSERT INTO departments (name, description) VALUES
('Machining', 'CNC and machining center'),
('Welding', 'Robotic welding cell'),
('Assembly', 'Final assembly line'),
('Press Shop', 'Press machines'),
('Conveyor Systems', 'Logistics & conveying');

-- All demo users have password: password123
INSERT INTO users (email, password, full_name, employee_id, department_id, role_id) VALUES
('technician@demo.com', '$2b$10$qqRM5XqP3Z.QhaDkM7Td0ORealsg78M6IVM52lLL0ne5wNgPhv5D2', 'Ravi Kumar', 'EMP-1001', 1, 1),
('technician2@demo.com', '$2b$10$qqRM5XqP3Z.QhaDkM7Td0ORealsg78M6IVM52lLL0ne5wNgPhv5D2', 'Anil Sharma', 'EMP-1002', 2, 1),
('expert@demo.com', '$2b$10$qqRM5XqP3Z.QhaDkM7Td0ORealsg78M6IVM52lLL0ne5wNgPhv5D2', 'Suresh Patel', 'EMP-2001', 1, 2),
('expert2@demo.com', '$2b$10$qqRM5XqP3Z.QhaDkM7Td0ORealsg78M6IVM52lLL0ne5wNgPhv5D2', 'Meera Iyer', 'EMP-2002', 3, 2),
('admin@demo.com', '$2b$10$qqRM5XqP3Z.QhaDkM7Td0ORealsg78M6IVM52lLL0ne5wNgPhv5D2', 'Prakash Rao', 'EMP-3001', NULL, 3);

INSERT INTO expert_profiles (user_id, years_experience, specialties, skills, bio) VALUES
(3, 12, 'CNC / Machining', 'Spindle, Tooling, Vibration', 'Senior maintenance engineer specialized in CNC troubleshooting.'),
(4, 9, 'Assembly & Robotics', 'Robot programming, Sensors, Safety', 'Expert in assembly robots and production line integrations.');

INSERT INTO machines (machine_code, name, machine_type, department_id, production_line, status, manufacturer, model, installation_date, location, description) VALUES
('CNC-C-12', 'CNC C-12', 'CNC Machining Center', 1, 'Line-A', 'OPERATIONAL', 'Mazak', 'QTN-200', '2020-03-15', 'Shop Floor A1', 'High-speed CNC machining center'),
('CNC-C-15', 'CNC C-15', 'CNC Machining Center', 1, 'Line-A', 'OPERATIONAL', 'Mazak', 'QTN-250', '2021-06-10', 'Shop Floor A2', 'CNC center for large components'),
('WELD-W-04', 'Welding Robot W-04', 'Industrial Robot', 2, 'Line-B', 'OPERATIONAL', 'FANUC', 'ARC Mate 100iD', '2019-09-20', 'Welding Cell B1', 'Robotic arc welding station'),
('WELD-W-07', 'Welding Robot W-07', 'Industrial Robot', 2, 'Line-B', 'OPERATIONAL', 'ABB', 'IRB 1660ID', '2021-01-12', 'Welding Cell B2', 'High-precision welding robot'),
('CONV-A-03', 'Conveyor A-03', 'Conveyor System', 5, 'Line-C', 'OPERATIONAL', 'Bosch', 'TS-2plus', '2018-05-05', 'Assembly Hall C', 'Main transfer conveyor'),
('PRESS-P-08', 'Press Machine P-08', 'Hydraulic Press', 4, 'Line-D', 'MAINTENANCE', 'Schuler', 'MSD2-630', '2017-11-18', 'Press Shop D1', '630-ton hydraulic press'),
('AR-02', 'Assembly Robot AR-02', 'Assembly Robot', 3, 'Line-E', 'OPERATIONAL', 'KUKA', 'KR 10 R1100', '2022-02-28', 'Assembly Line E', 'Assembly robot for powertrain');

INSERT INTO incidents (title, description, symptoms, machine_id, department_id, priority, status, reported_by, troubleshooting_performed, root_cause, solution, verification_status, ai_generated, incident_date) VALUES
('CNC C-12 high-speed vibration', 'Heavy vibration during high speed operation.', 'Excessive vibration, noise', 1, 1, 'HIGH', 'RESOLVED', 1, 'Checked spindle, tool holder, tightened, realigned.', 'Loose tool holder', 'Tighten and realign tool holder', 'EXPERT_VERIFIED', TRUE, NOW() - INTERVAL '12 days'),
('Welding Robot W-04 sudden arm stoppage', 'Robot arm stopped mid-cycle.', 'Sudden stop, no error on HMI', 3, 2, 'CRITICAL', 'RESOLVED', 2, 'Checked sensors, recalibrated.', 'Position sensor misalignment', 'Recalibrate position sensor', 'EXPERT_VERIFIED', TRUE, NOW() - INTERVAL '8 days'),
('Conveyor A-03 abnormal noise', 'Grinding noise from conveyor drive.', 'Abnormal noise, vibration', 5, 5, 'MEDIUM', 'RESOLVED', 1, 'Replaced bearing.', 'Bearing wear', 'Replace bearing', 'EXPERT_VERIFIED', TRUE, NOW() - INTERVAL '20 days'),
('Press P-08 hydraulic pressure drop', 'Intermittent pressure drop.', 'Pressure fluctuation', 6, 4, 'HIGH', 'INVESTIGATING', 2, 'Checked oil level, pump.', NULL, NULL, 'PENDING_VERIFICATION', TRUE, NOW() - INTERVAL '2 days'),
('Assembly Robot AR-02 gripper fault', 'Gripper misalignment.', 'Part drop', 7, 3, 'MEDIUM', 'OPEN', 1, 'Visual inspection.', NULL, NULL, 'AI_GENERATED', FALSE, NOW() - INTERVAL '1 day');

INSERT INTO knowledge_entries (incident_id, machine_id, title, problem, symptoms, possible_cause, root_cause, troubleshooting_steps, solution, severity, category, status, submitted_by, verified_by, verified_at, expert_comment, helpful_count, view_count) VALUES
(1, 1, 'CNC C-12 High-Speed Vibration', 'High-speed vibration', 'Excessive vibration at high RPM', 'Loose tool holder', 'Loose tool holder', E'1. Check spindle\n2. Inspect tool holder\n3. Tighten tool holder\n4. Realign', 'Tighten and realign tool holder', 'HIGH', 'Mechanical', 'EXPERT_VERIFIED', 1, 3, NOW() - INTERVAL '10 days', 'Correct diagnosis. Check runout after realignment.', 12, 45),
(2, 3, 'Welding Robot W-04 Sudden Arm Stoppage', 'Sudden arm stoppage', 'Arm stops without error', 'Sensor misalignment', 'Position sensor misalignment', E'1. Inspect sensor\n2. Check encoder\n3. Recalibrate', 'Recalibrate position sensor', 'CRITICAL', 'Electrical', 'EXPERT_VERIFIED', 2, 4, NOW() - INTERVAL '6 days', 'Verified. Recommend quarterly calibration.', 8, 32),
(3, 5, 'Conveyor A-03 Abnormal Noise', 'Abnormal grinding noise', 'Grinding noise, vibration', 'Bearing wear', 'Bearing wear', E'1. Inspect bearing\n2. Try greasing\n3. Replace bearing', 'Replace bearing', 'MEDIUM', 'Mechanical', 'EXPERT_VERIFIED', 1, 3, NOW() - INTERVAL '18 days', 'Bearing replacement is correct.', 15, 60);

INSERT INTO tags (name, category) VALUES
('CNC', 'Machine Type'), ('Vibration', 'Symptom'), ('Tool Holder', 'Component'),
('Welding', 'Process'), ('Sensor', 'Component'), ('Conveyor', 'Machine Type'),
('Bearing', 'Component'), ('Hydraulic', 'System'), ('Robot', 'Machine Type');

INSERT INTO knowledge_tags (knowledge_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7);

INSERT INTO incident_comments (incident_id, user_id, comment) VALUES
(1, 3, 'Good catch. Verify spindle runout after realignment.'),
(2, 4, 'Please schedule sensor calibration for all welding cells.');
