module.exports = { //method returning array of objects via promise
  getCourseById(knex, course_id){
    return knex('courses')
    .where('id', course_id)
    .first()
  },
  getCoursesBySchedule(knex, schedule){
    return knex('courses as c')
      .join('course_schedules as cs', 'c.id', '=', 'cs.course_id')
      .select(
        'c.name as Course'
        , 'c.id as Course_id'
        , 'cs.schedule'
        , 'cs.hours'
        , 'cs.duration'
      )
      .where('cs.schedule', '=', schedule)
  },
  getScheduleByCourseAndSchedule(knex, course_id, schedule){
    return knex('course_schedules as cs')
    .select('*')
    .where('course_id', course_id)
    .andWhere('schedule', schedule)
    .first()
  },
  getCoursesByPaymentSummary(knex, fin_assist){
    return knex('courses as c')
      .join('payment_summaries as p', 'c.id', '=', 'p.course_id')
      .select(
        'c.name as Course'
        , 'c.id as Course_id'
        , 'p.up_front'
        , 'p.financing'
        , 'p.isa'
        , 'p.placement_based'
        , 'p.repayment_guarantee'
      )
      .where('p.financing', fin_assist)
  },
  getCoursesAndLanguages(knex){
    return knex('course_languages as cl')
      .innerJoin('languages as la', 'la.id', '=', 'cl.language_id')
      .innerJoin('courses as c', 'c.id', '=', 'cl.course_id')
      .select(
        'c.name as Course'
        , 'c.id as Course_id'
        , 'la.language'
      )
  }
}
