CREATE TABLE bootcamp_locations (
  bootcamp_id INTEGER REFERENCES bootcamps(id),
  location_id INTEGER REFERENCES locations(id),
  PRIMARY KEY (bootcamp_id, location_id)
);
