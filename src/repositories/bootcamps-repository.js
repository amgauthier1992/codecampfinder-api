module.exports = {
  getBootcampsAndCoursesBy(knex, is_online, prior_experience){
    return knex('bootcamp_courses as bc')
      .innerJoin('bootcamps as b', 'b.id', '=', 'bc.bootcamp_id')
      .innerJoin('courses as c', 'c.id', '=', 'bc.course_id')
      .select(
        'c.name as Course'
        , 'c.id as Course_id'
        , 'c.is_online'
        , 'c.solo_instruction'
        , 'c.pair_programming'
        , 'c.prior_experience'
        , 'b.name as Bootcamp'
        , 'b.id as Bootcamp_id'
        , 'b.url as Website'
      )
      .where('c.is_online', is_online)
      .andWhere('c.prior_experience', prior_experience)
  },
  getBootcampLocations(knex, stateCode){ 
    return knex('bootcamp_locations as bl')
      .innerJoin('locations as l', 'l.id', '=', 'bl.location_id')
      .innerJoin('bootcamps as b', 'b.id', '=', 'bl.bootcamp_id')
      .select(
        'b.name as Bootcamp'
        , 'b.id as Bootcamp_id'
        , 'l.city'
        , 'l.state'
      )
      .where('l.state', stateCode)
  },
  getBootcampAndCourse(knex, bootcampName, courseName){
    return knex('bootcamp_courses as bc')
      .innerJoin('courses as c', 'c.id', '=', 'bc.course_id')
      .innerJoin('bootcamps as b', 'b.id', '=', 'bc.bootcamp_id')
      .select(
        'b.id as Bootcamp_id'
        , 'b.name as Bootcamp'
        , 'c.id as Course_id'
        , 'c.name as Course'
      )
      .where('b.name', bootcampName)
      .andWhere('c.name', courseName)
      .first()
  }
}
