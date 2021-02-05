CREATE TABLE user_courses (
  course_id INTEGER REFERENCES courses(id),
  user_name TEXT NOT NULL REFERENCES users(user_name),
  schedule_type INTEGER REFERENCES course_schedules(id),
  PRIMARY KEY (course_id, user_name, schedule_type)
);


