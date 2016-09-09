import config from '../../config';
import mongodb from 'mongodb';
var express = require('express');
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var app = express();
const DBurl = config.DBurl;


router.post("/",function (req,res) {
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
module.exports = router;