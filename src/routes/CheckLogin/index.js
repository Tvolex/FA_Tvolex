import config from '../../config';
import mongodb from 'mongodb';
var express = require('express');
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var app = express();
const DBurl = config.DBurl;


router.post("/",function (req,res) {
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
module.exports = router;