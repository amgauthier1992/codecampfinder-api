const BootcampRepo = require('../repositories/bootcamps-repository');

module.exports = {
  getBootcampsAndCourses(knex, is_online, prior_experience){

    let promise = new Promise((resolve, reject) => {
      BootcampRepo.getBootcampsAndCoursesBy(knex, is_online, prior_experience) 
        .then((data) => {
        
          let results = [] //push new bootcamps into this array

          if (data === null) {
            return results;
          }

          for (let i = 0; i < data.length; i++){
            let row = data[i];
            let newBootcamp = false;

            //find returns first match. 
            let bootcamp = results.find(b => b.BootcampId == row.Bootcamp_id);
            
            //if null, then new bootcamp
            if (bootcamp == null){
              newBootcamp = true;
              bootcamp = {
                BootcampId: row.Bootcamp_id,
                Name: row.Bootcamp,
                Website: row.Website,
                Courses: [],
              }
            }

            //add course
            bootcamp.Courses.push({
              CourseId: row.Course_id,
              Name: row.Course,
              Is_online: row.is_online,
              Solo_instruction: row.solo_instruction,
              Pair_programming: row.pair_programming,
              Prior_experience: row.prior_experience
            })

            if(newBootcamp){
              results.push(bootcamp)
            }
          }

          resolve(results)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })

    return promise;
  },

  getBootcampsAndLocations(knex, stateCode){
    let promise = new Promise((resolve, reject) => {
      BootcampRepo.getBootcampLocations(knex, stateCode)
        .then((data) => {

          let results = [];

          if(data == null){
            return results;
          }

          for (let i = 0; i < data.length; i++){
            let row = data[i];
            let bootcampLocation = {
              BootcampId: row.Bootcamp_id,
              BootcampName: row.Bootcamp,
              Locations: []
            }
            let location = {
              city: row.city,
              state: row.state
            }

            let bootcamp = results.find(b => b.BootcampId == row.Bootcamp_id)
            
            //if we have a bootcamp, add location
            if(bootcamp){
              bootcamp.Locations.push(location)
            }
            //if we have no bootcamp, add the bootcamp and it's location
            else {
              bootcampLocation.Locations.push(location)
              results.push(bootcampLocation)
            }
          }

          resolve(results);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
    })

    return promise; 
  },

  getBootcampAndCourse(knex, bootcampName, courseName){
    return BootcampRepo.getBootcampAndCourse(knex, bootcampName, courseName)
  }
}
