import config from '../config';
import mongodb from 'mongodb';
import express from 'express';

const DBurl = config.DBurl;
const router = express.Router();
const MongoClient = mongodb.MongoClient;

var login = router.get('/', (req, res) => {
    
        var Session = {};
        Session.id = req.session.id;
        Session.UserEmail = req.session.UserEmail;

        try {
            MongoClient.connect(DBurl, (err,db) => {
                if(err) {
                    console.log("Error", err);
                } else {
                    console.log("Connection to db: " + DBurl);
                    var collection = db.collection("users");
                    collection.find({"UserEmail" : Session.UserEmail, "SessionID" : req.session.id}).limit(1).next((err, doc) => {
                        if(err) {
                            console.log("Error : " + err);
                        } else if(doc) {
                            res.cookie('btnExit', true);
                            res.json(doc);
                        } else if(!doc) {
                            res.clearCookie('btnExit')
                                .json(doc);
                        }
                        db.close();
                    });
                }
            });
        } catch (e) {
            console.log(e);
            res.status(400);
        }
    
   
});

module.exports = login;