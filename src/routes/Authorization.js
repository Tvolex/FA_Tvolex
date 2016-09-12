import config from '../config';
import mongodb from 'mongodb';
import express from 'express';

const DBurl = config.DBurl;
const router = express.Router();
const MongoClient = mongodb.MongoClient;

var Auth = router.post("/", (req,res) => {

    var UserEmail = req.body.UserEmail;
    var UserPassword = req.body.password;
    var HaveUser = {};

    try {
        MongoClient.connect(DBurl, (err, db) => {
            if (err) {
                console.log('Unable to connect to the MongoDB server. Error:', err);
            } else {
                console.log('Connection to db', DBurl);
                var collection = db.collection('users');
                collection.find({"UserEmail": UserEmail, "password": UserPassword}).toArray((err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {                                                      // в бд є такий юзер
                        HaveUser.UserEmail = UserEmail;
                        collection.updateOne({"UserEmail": UserEmail}, {$set: {"SessionID" : req.sessionID}});
                        req.session.UserEmail = UserEmail;
                        res.cookie('btnExit', true)
                            .status(200)
                            .send(HaveUser)
                            .end();
                    } else {                                                                  // в бд немає такого юзера
                        HaveUser.UserEmail = undefined;
                        res.status(401)
                            .send(HaveUser)
                            .end();
                    }
                    db.close();
                });
            }
        });
    } catch (e){
        res.send(400,"Err");
        res.end();
    }
});

module.exports = Auth;