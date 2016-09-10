import config from '../config';
import mongodb from 'mongodb';
import express from 'express';

const router = express.Router();
const MongoClient = mongodb.MongoClient;
const DBurl = config.DBurl;

var deleteAcc = router.post("/",function (req,res) {
    console.log("Session destroyed");
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

module.exports = deleteAcc;