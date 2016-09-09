const config = require('./config');
import express from 'express';
import http from 'http';
import mongodb from 'mongodb';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import connect from 'connect';
import login from './routes/login/index';
import Auth from './routes/Authorization/index';
import Register from './routes/Register/index';
import deleteAcc from './routes/deleteAcc/index';
import CheckLogin from './routes/CheckLogin/index';


const app = express();
const DBurl = config.DBurl;
var MongoClient = mongodb.MongoClient;


app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: 'Tvolex hehehehe 2016',
    resave: false,
    saveUninitialized: true
}));

app.use('/Authorization', Auth);
app.use('/Register', Register);
app.use('/CheckLogin', CheckLogin);
app.use('/login', login);
app.use('/deleteAcc', deleteAcc);

app.use(express.static(path.join(__dirname,"../../public/html")));
app.post("/AuthForDesktop",function (req,res) {
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
});



app.post("/change",function (req,res) {
    var UserEmail =  req.session.UserEmail;
    var NewUserEmail = req.body.UserEmail;
    var OldPass = req.body.OldPass;
    var NewPass = req.body.NewPass;
    var ConfNewPass = req.body.ConfNewPass;
    var RealName = req.body.RealName;
    var RealSurName = req.body.RealSurName;

    var user = {};

    if(NewUserEmail) {
        MongoClient.connect(DBurl, function (err,db) {
            if(err) {
                console.log("Change");
                console.log(err)
            } else {
                console.log("Connection to db: " + DBurl);
                var collection = db.collection("users");
                collection.find({"UserEmail": NewUserEmail}).limit(1).toArray(function (err,result) {
                    if(err) {
                        console.log("Change");
                        console.log(err);
                    } else if(!result.length) {
                        console.log("Change");
                        collection.updateOne({"UserEmail": UserEmail}, {$set: {"UserEmail" : NewUserEmail}});
                        console.log("Change name: ", NewUserEmail);
                        user.ChangeUserEmail = true;
                        user.UserEmail = NewName;
                        res.json(user)
                    } else if(result.length) {
                        console.log("Change");
                        user.ChangeUserEmail = false;
                        res.json(user);
                    }
                    db.close();
                });
            }
        })
    }
    if(NewPass){
        MongoClient.connect(DBurl, function (err,db) {
            if(err) {
                console.log("Error", err);
            } else {
                console.log("Connection to db: " + DBurl);
                var collection = db.collection("users");
                collection.find({"UserEmail" : UserEmail, "password": OldPass}).limit(1).toArray(function (err, result) {
                    if(err) {
                        console.log(err);
                    } else if(result.length) {
                        user.ChangePass = true;
                        collection.updateOne({"UserEmail": UserEmail}, {$set: {"password" : NewPass}});
                        console.log("Change");
                        console.log("Change pass: ", NewPass);
                        res.json(user)
                    } else if(!result.length) {
                        user.ChangePass = false;
                        res.json(user);
                    }
                    db.close();
                });
            }});
    }
    if(RealName != undefined) {
        MongoClient.connect(DBurl, function (err,db) {
            if(err) {
                console.log(err)
            } else {
                console.log("Connection to db: " + DBurl);
                var collection = db.collection("users");
                collection.find({"UserEmail" : UserEmail}).limit(1).toArray(function (err, result) {
                    if(err){
                        console.log(err)
                    } else if(result) {
                        console.log("Change");
                        console.log("Saved real name: ", RealName);
                        collection.updateOne({"UserEmail": UserEmail}, {$set: {"RealName" : RealName, "RealSurName" : RealSurName}});
                        user.saved = true;
                        res.json(user);
                    } else if(!result) {
                        user.saved = false;
                        res.json(user);
                    }
                    db.close();
                })
            }
        })
    }

});


app.post("/delete",function (req,res) {
    console.log("Session destroyed");

    req.session.destroy();
    res.clearCookie('btnExit');
    res.send("del");
});

app.get("/ping", function (req,res) {
    console.log("____________________________________________________________________________________________________");
    console.log(req);
    res.send(req);
    res.end();
});


app.listen(config.port, () => {
    console.log('Server start on port ' + config.port);
});
