import config from './config';
import express from 'express';
import http from 'http';
import mongodb from 'mongodb';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import connect from 'connect';

const app = express();
var MongoClient = mongodb.MongoClient;

app.use(cookieParser());
app.use(session({
    secret: 'Tvolex hehehehe 2016',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser());

app.use(express.static(path.join(__dirname,"../public")));
app.post("/Authorization", function (req,res,next) {
    console.log("Session ID: " , req.sessionID);
    var UserEmail = req.body.UserEmail;
    var UserPassword = req.body.password;
    var HaveUser = {};

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
                        res.send(200,HaveUser);
                        res.end();
                    } else {                                                                  // в бд немає такого юзера
                        HaveUser.UserEmail = undefined;
                        console.log("Authorization");
                        console.log('No document found : ' + UserEmail);
                        console.log("Login: " + UserEmail);
                        console.log("Password: " + UserPassword);
                        res.send(401,HaveUser);
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

app.post("/Register", function (req,res) {
    var UserEmail = req.body.UserEmail;
    var RegisterPassword = req.body.RegisterPassword;
    MongoClient.connect(DBurl, function (err,db) {
        if(err) {
            console.log("Error" + err);
            var DBError = {};
            DBError.isError = true;
            DBError.descripError = err;
            res.send(DBError);
            res.end();
        } else {
            console.log("Connection to db: " + DBurl);
            var collection = db.collection("users");
            var user = {};
            collection.find({"UserEmail" : UserEmail}).toArray(function (err,result) {
                if(err) {
                    console.log("Error : " + err);
                } else if(result.length) {
                    // перенаправлення на /CheckLogin  - провірка логіна
                    console.log("User exist");
                    res.redirect("/CheckLogin");
                    res.end();
                } else if(!result.length) {
                    // тут користувач здійснює саму реєстрацію
                    user.IsBusy = false;
                    var UsersDocument = {"UserEmail" : UserEmail, "password" : RegisterPassword, "SessionID" : req.sessionID};
                    collection.insertOne(UsersDocument);
                    collection.createIndex({"name" : 1}, {"unique" : true});
                    console.log("New user : " , UserEmail);
                    req.session.UserEmail = UserEmail;
                    res.cookie('btnExit', true);
                    res.status(200).send(user);
                    res.end();
                }
                db.close();
            });

        }
    })
});

app.get("/login",function (req,res) {
    var Session = {};
    Session.id = req.session.id;
    Session.UserEmail = req.session.UserEmail;
    MongoClient.connect(DBurl, function (err,db) {
        if(err) {
            console.log("Error", err);
        } else {
            console.log("Connection to db: " + DBurl);
            var collection = db.collection("users");
            console.log("UserEmail: " + Session.UserEmail);
            console.log("sess id: " , req.session.id);
            collection.find({"UserEmail" : Session.UserEmail, "SessionID" : req.session.id}).limit(1).next(function (err, doc) {
                if(err) {
                    console.log("Login");
                    console.log("Error : " + err);
                } else if(doc) {
                    console.log("Login");
                    console.log("Found: ", doc.UserEmail);
                    res.cookie('btnExit', true);
                    res.status(200).json(doc);

                } else if(!doc) {
                    console.log("Login");
                    res.clearCookie('btnExit');
                    console.log("Found:", doc);
                    res.json(doc);
                }
                db.close();
            });

        }
    });
});
app.post("/CheckLogin",function (req,res) {
    var user = {};
    user.UserEmail = req.body.UserEmail;
    MongoClient.connect(DBurl, function (err,db) {
        if(err) {
            console.log("Error", err);
        } else {
            console.log("Connection to db: " + DBurl);
            var collection = db.collection("users");
            collection.find({"UserEmail" : user.UserEmail}).limit(1).toArray(function (err, result) {
                if(err) {
                    console.log("Check Login");
                    console.log("Error : " + err);
                } else if(result.length) {
                    console.log("Check Login");
                    console.log("Found: ", result.length);
                    user.IsBusy = true;
                    res.status(200).send(user);
                    res.end();

                } else if(!result.length) {
                    console.log("Check Login");
                    console.log("Found:", result.length);
                    user.IsBusy = false;
                    res.status(200).send(user);
                    res.end();
                }
                db.close();
            });

        }
    });
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
app.post("/deleteAcc",function (req,res) {
    console.log("Session destroyed");
    console.log("Account delete: " + UserEmail);
    var UserEmail =  req.session.UserEmail;
    MongoClient.connect(DBurl, function (err,db) {
        if(err) {
            console.log(err)
        } else {
            console.log("Connection to db: " + DBurl);
            var collection = db.collection("users");
            collection.removeOne({"UserEmail" : UserEmail});
            db.close();
        }
    });
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
app.use(function(req, res, next) {
    res.status(404);
    res.sendfile("error/404/index.html");
});
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(config.port, () => {
    console.log('Perfect!');
});
