CREATE TABLE bootcamp_courses (
  bootcamp_id INTEGER REFERENCES bootcamps(id),
  course_id INTEGER REFERENCES courses(id),
  PRIMARY KEY (bootcamp_id, course_id)
);