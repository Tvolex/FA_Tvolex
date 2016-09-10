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

const app = express();
const DBurl = config.DBurl;


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
    var RealName = req.body.RealName;
    var RealSurName = req.body.RealSurName;

    var user = {};

    if(NewUserEmail) {
        try {
            MongoClient.connect(DBurl, function (db) {
                
                    console.log("Connection to db: " + DBurl );
                    var collection = db.collection("users");
                    collection.find({"UserEmail": NewUserEmail}).limit(1).toArray(function (err,result) {
                         if(!result.length) {
                             collection.updateOne({"UserEmail": UserEmail}, {$set: {"UserEmail" : NewUserEmail}});
                             user.ChangeUserEmail = true;
                             user.UserEmail = NewName;
                            res.json(user)
                        } else if(result.length) {
                             user.ChangeUserEmail = false;
                            res.json(user);
                        }
                        db.close();
                    });
                })
        }}
    if(NewPass){
        try {
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
       
    }
    if(RealName != undefined) {
        try {
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
module.exports = app;