import express from 'express';
import config from '../config';
import * as MongoClient from "mongodb/lib/mongo_client";

const router = express.Router();
const DBurl = config.DBurl;

var change = router.post('/', function(req, res) {
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
module.exports = change;
