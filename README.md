# CodeCampFinder API

Find a coding bootcamp that's right for you. Search for coding bootcamps and their associated course offerings based on your location and individualized criteria.

This is the backend for `customURL`. A live version of the app can be found at [customURL](customURL)

The front end client can be found at [https://github.com/amgauthier1992/codecampfinder](https://github.com/amgauthier1992/codecampfinder).

## Introduction

With coding bootcamps on the rise as a potential alternative to break into tech, and with so many options for prospective students looking to delve into an exciting new career, it's hard to decide which institution aligns best with your values and will actually help you achieve your goals. This application was designed to serve as a tool to assist and streamline the process of exploring some of the nation's most popular coding bootcamps and their available courses.

_Disclaimer_ - Information regarding bootcamps and courses, especially information surrounding financing and tuition figures are constantly fluid and changing. We try our best to keep all of this information up-to-date, but for the most accurate information, you will want to visit a bootcamp's website via the app directly.

## Future Developments

- Implement a portal specific to bootcamp administrators that allows them to update pertinent information for their bootcamp and individual course offerings.
- Allow admins to add new courses to their bootcamps course catalog.

## Quick App Demo

![Login](https://i.imgur.com/KEI6rrS.png)
![Dashboard](https://i.imgur.com/T8urHrY.png)
![Search](https://i.imgur.com/8rwZH5P.png)
![Results](https://i.imgur.com/9wJp1PK.png)

## Technology

#### Back End

- Node and Express
  - Authentication via JWT
  - RESTful API
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - Postgres
  - Knex.js - SQL query builder

#### Production

Deployed via Heroku

## Set up

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, `cd` into the directory and run `npm install`
2. Create the dev and test databases: `createdb -U <role> -d codecampfinder` and `createdb -U <role> -d codecampfinder-test`

3. Create a `.env` and a `.env.test` file in the project root

Inside these files you'll need the following:

```
NODE_ENV=development
PORT=8000

DATABASE_URL='postgresql://<role>@localhost/codecampfinder'
TEST_DATABASE_URL='postgresql://<role>@localhost/codecampfinder-test'

JWT_SECRET=<your-secret-here>
```

Your `.env.test` will be the same except your `DATABASE_URL` will be the value from `TEST_DB_URL` above. Alternatively, you can also just create one .env file and change the connection property on the db/knex object in your server.js file like so:

```
const db = knex({
  client: 'pg',
  connection: TEST_DATABASE_URL,
  //connection: DATABASE_URL,
});
```

4. Run the migrations for dev - `npm run migrate`
5. Run the migrations for test - `env NODE_ENV=test npm run migrate`
6. Seed the database for test using the provided batch file. To seed for dev, replace `codecampfinder-test` with `codecampfinder` at the end of each seed script.

- Navigate to seeds/run-seeds.bat in the project directory.
- Shift + Alt + R (Reveal in File explorer)
- Navigate one directory down to seed folder in File explorer
- Erase all content in address bar, Type in cmd to open Windows cmd prompt, Hit enter.
- Type in run-seeds.bat / Hit enter

7. Run the tests - `npm t`
8. Start the server - `npm run dev`
