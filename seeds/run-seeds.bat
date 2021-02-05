@echo off
echo Seeding Database
cd seeds

@REM Bootcamps
psql -f .\seed.bootcamps.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.locations.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.bootcamp_locations.sql -U dunder_mifflin codecampfinder-test 

@REM Courses
psql -f .\seed.courses.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.bootcamp_courses.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.course_schedules.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.payment_summaries.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.languages.sql -U dunder_mifflin codecampfinder-test
psql -f .\seed.course_languages.sql -U dunder_mifflin codecampfinder-test

@REM User Courses
@REM psql -f .\seed.user_courses.sql -U dunder_mifflin codecampfinder-test

@REM Shift + Alt + R (Reveal in File explorer)
@REM Navigate to seed folder. 
@REM Erase address bar. Type in cmd. Hit enter
@REM Type in run-seeds.bat - Hit enter
