import config from './config';
import express from 'express';
import * as MongoClient from "mongodb/lib/mongo_client";
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
app.use('/Register', Register);
app.use('/CheckLogin', CheckLogin);
app.use('/login', login);
app.use('/deleteAcc', deleteAcc);
app.use('change', change);
app.use('/delete', deleteS);
/*app.post("/AuthForDesktop",function (req,res) {
    var UserEmail = req.headers.email;
    var UserPassword = req.headers.password;
    var HaveUser= {};
    if (UserEmail != undefined) {
        MongoClient.connect(DBurl, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection to', DBurl);
                var collection = db.collection('users');
                collection.find({"UserEmail": UserEmail, "password": UserPassword}).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {                                                      // в бд є такий юзер
                        HaveUser.UserEmail = UserEmail;
                        collection.updateOne({"UserEmail": UserEmail}, {$set: {"SessionID" : req.sessionID}});
                        req.session.UserEmail = UserEmail;
                        console.log("Authorization");
                        console.log("Found: ", result);
                        console.log("Login: " + UserEmail);
                        console.log("Password: " + UserPassword);
                        res.cookie('btnExit', true);
                        res.status(200).send(HaveUser);
                        res.end();
                    } else {                                                                  // в бд немає такого юзера
                        HaveUser.UserEmail = undefined;
                        console.log("Authorization");
                        console.log('No document found : ' + UserEmail);
                        console.log("Login: " + UserEmail);
                        console.log("Password: " + UserPassword);
                        res.status(401).send(HaveUser);
                        res.end();
                    }
                    db.close();
                });
            }
        });
    } else {
        res.send(400,"Email undefined");
        res.end();
    }
});*/

app.listen(config.port, () => {
    console.log('Server start on port ' + config.port);
   
});
module.exports = app;