const bcrypt = require('bcryptjs');

module.exports = {
  createUser(knex, newUser){
    return knex
      .insert(newUser) 
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  postLogin(knex, user_name, password){
    return knex
      .select('*')
      .from('users')
      .where({ user_name, password })
      .first()
  },
  getUserWithUsername(knex, user_name){
    return knex
      .select(
        'user_name'
        ,'first_name'
        ,'last_name'
        ,'password'
      )
      .from('users')
      .where({ user_name })
      .first()
  },
  comparePasswords(password, hash){
    return bcrypt.compare(password, hash)
  },
  addUserCourse(knex, userCourse){
    return knex
      .insert(userCourse)
      .into('user_courses')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getUserCourses(knex, user_name){
    return knex('bootcamp_courses as bc')
      .select(
        'b.name as Bootcamp'
        , 'c.name as Course'
        , 'c.id as CourseId'
      )
      .innerJoin('courses as c', 'c.id', '=', 'bc.course_id')
      .innerJoin('bootcamps as b', 'b.id', '=', 'bc.bootcamp_id')
      .innerJoin('user_courses as uc', 'uc.course_id', '=', 'bc.course_id')
      .where('uc.user_name', user_name)
  },
  getUserCourseSchedule(knex, course_id){
    return knex.raw(`
      SELECT cs.id, cs.schedule AS type, cs.hours, cs.duration
      FROM courses AS c
      INNER JOIN course_schedules AS cs ON c.id = cs.course_id
      INNER JOIN user_courses AS uc ON c.id = uc.course_id AND cs.id = uc.schedule_type
      WHERE c.id = ?
      LIMIT 1;
    `, [course_id])
    .then(result => result.rows[0]);
  },
  getUserCoursePaymentSummary(knex, course_id){
    return knex('courses as c')
      .select(
        'p.up_front'
        ,'p.financing'
        ,'p.isa'
        ,'p.placement_based'
        ,'p.repayment_guarantee'
      )
      .innerJoin('payment_summaries as p', 'c.id', '=', 'p.course_id')
      .where('c.id', course_id)
      .first()
  },
  getUserCourseLanguages(knex, course_id){
    return knex('course_languages as cl')
      .select('la.language')
      .innerJoin('languages as la', 'la.id', '=', 'cl.language_id')
      .innerJoin('courses as c', 'c.id', '=', 'cl.course_id')
      .where('c.id', course_id)
  },
  deleteUserCourse(knex, course_id, user_name, schedule_type){
    return knex('user_courses as uc')
      .where({ course_id })
      .andWhere({ user_name })
      .andWhere({ schedule_type })
      .delete()
  }
}
