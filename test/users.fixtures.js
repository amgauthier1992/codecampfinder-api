function createLoginUser() {
  return {
    first_name: 'John',
    last_name: 'Smith',
    user_name: 'JSmith123',
    password: 'Abc1234!'
  }
};

function createCourseObject(){
  return {
    Bootcamp: 'App Academy',
    Course: {
      Name: '24 Week Software Engineering Immersive',
      Schedule: { Type: 'full_time', Hours: 60, Duration: 24 }
    },
    UserName: 'JSmith123'
  }
};

module.exports = {
  createLoginUser,
  createCourseObject
};
