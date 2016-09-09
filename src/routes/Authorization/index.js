import config from '../../config';
import mongodb from 'mongodb';
var express = require('express');
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var app = express();
const DBurl = config.DBurl;

router.post("/", function (req,res,next) {

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
module.exports = router;