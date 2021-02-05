require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./middleware/error-handler');
const usersRouter = require('./routers/users-router');
const searchRouter = require('./routers/search-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}));

app.use(cors());
app.use(helmet());

// routers
app.use(usersRouter);
app.use(searchRouter);

app.use(errorHandler);

module.exports = app;
