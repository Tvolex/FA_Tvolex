import config from '../../config';
import mongodb from 'mongodb';
var express = require('express');
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var app = express();
const DBurl = config.DBurl;
/* GET home page. */
router.get('/', function(req, res, next) {
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
                    res.status(200).send(doc);

                } else if(!doc) {
                    console.log("Login");
                    res.clearCookie('btnExit');
                    console.log("Found:", doc);
                    res.send(doc);
                }
                db.close();
            });

        }
    });
});

module.exports = router;