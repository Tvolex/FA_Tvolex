import config from './config';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

//noinspection JSUnresolvedVariable
import HomePage from './routes/HomePage';
//noinspection JSUnresolvedVariable
import login from './routes/login';
//noinspection JSUnresolvedVariable
import Authorization from './routes/Authorization';
//noinspection JSUnresolvedVariable
import AuthFD from './routes/AuthForDesktop';
//noinspection JSUnresolvedVariable
import Register from './routes/Register';
//noinspection JSUnresolvedVariable
import deleteAcc from './routes/deleteAcc';
//noinspection JSUnresolvedVariable
import CheckLogin from './routes/CheckLogin';
//noinspection JSUnresolvedVariable
import change from './routes/change';
//noinspection JSUnresolvedVariable
import deleteS from './routes/deleteS'


const app = express();



app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: 'Tvolex hehehehe 2016',
    resave: false,
    saveUninitialized: true
}));


//noinspection JSUnresolvedVariable
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', HomePage);
app.use('/Authorization', Authorization);
app.use('/AuthForDesktop', AuthFD);
app.use('/Register', Register);
app.use('/CheckLogin', CheckLogin);
app.use('/login', login);
app.use('/deleteAcc', deleteAcc);
app.use('change', change);
app.use('/delete', deleteS);


app.listen(config.port, () => {
    console.log('Server start on port ' + config.port);
   
});
module.exports = app;