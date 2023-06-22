const express = require('express');
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser');

const { PORT } = require('./config/env');
const routes = require('./routes');
const { dbInit } = require('./config/db');
const { auth } = require('./middleWares/authMiddleware');
const { errorHandler } = require('./middleWares/errHandlerMiddleware');


const app = express();

app.engine('hbs', hbs.engine({
    extname: 'hbs'
}));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(auth);
app.use(routes);
app.use(errorHandler);

dbInit();
app.listen(PORT, console.log(`Server is running on PORT ${PORT}`));