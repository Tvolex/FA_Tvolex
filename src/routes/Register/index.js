import config from '../../config';
import mongodb from 'mongodb';
var express = require('express');
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var app = express();
const DBurl = config.DBurl;

router.post("/", function (req,res) {
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
module.exports = router;