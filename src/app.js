import config from './config';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongodb from 'mongodb';

//noinspection JSUnresolvedVariable
import login from './routes/login';
//noinspection JSUnresolvedVariable
import Authorization from './routes/Authorization';
//noinspection JSUnresolvedVariable
import AuthFD from './routes/AuthForDesktop';
//noinspection JSUnresolvedVariable
import Register from './routes/Register';
//noinspection JSUnresolvedVariable
import deleteAcc from './routes/deleteAcc';
//noinspection JSUnresolvedVariable
import CheckLogin from './routes/CheckLogin';
//noinspection JSUnresolvedVariable
import change from './routes/change';
//noinspection JSUnresolvedVariable
import deleteS from './routes/deleteS'


const app = express();
const DBurl = config.DBurl;
const MongoClient = mongodb.MongoClient;


app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: 'Tvolex hehehehe 2016',
    resave: false,
    saveUninitialized: true
}));


//noinspection JSUnresolvedVariable
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req,res)=>{
    res.redirect('/HomePage');
});
app.get('/index', (req,res)=>{
    //noinspection JSUnresolvedVariable
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/Enter', (req,res,next)=>{
    //noinspection JSUnresolvedVariable
    res.sendFile(path.join(__dirname, '../public/Enter.html'));
   
});
app.get('/AboutUs', (req,res)=>{
    //noinspection JSUnresolvedVariable
    res.sendFile(path.join(__dirname, '../public/AboutUs.html'));
});
app.get('/ShowMyOffice', (req,res)=>{
    res.redirect('/login');
});
app.get('/MyOffice',(req,res,next)=>{
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
                        //noinspection JSUnresolvedVariable
                        res.cookie('btnExit', true);
                            
                            next(doc);
                    } else if(!doc) {
                        res.clearCookie('btnExit')
                            .redirect('/Enter');
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
app.use('/', function (data,req, res,next) {
    console.log("DOC " + data.UserEmail);
    if(data) {
        var options = {
            headers: {
                "UserDoc" : data
            }
        };
        //noinspection JSUnresolvedVariable
        res.sendFile(path.join(__dirname, '../public/MyOffice.html'), options, function (err) {
            if(err){
                console.log("RES: " + err);
                res.status(err.status).end();
            } else {
                console.log("Send doc to client");
            }
        } );
    }
});

app.get('/Setting', (req,res)=>{
    //noinspection JSUnresolvedVariable
    res.sendFile(path.join(__dirname, '../public/Setting.html'));
});
app.get('/RandomImages', (req,res)=>{
    //noinspection JSUnresolvedVariable
    res.sendFile(path.join(__dirname, '../public/RandomImages.html'));
});
app.use('/Authorization', Authorization);
app.use('/AuthForDesktop', AuthFD);
app.use('/Register', Register);
app.use('/CheckLogin', CheckLogin);
app.use('/login', login);
app.use('/deleteAcc', deleteAcc);
app.use('/change', change);
/*app.post('/change', (req, res) => 
    var UserEmail =  req.session.UserEmail;
    var NewUserEmail = req.body.UserEmail;
    var OldPass = req.body.OldPass;
    var NewPass = req.body.NewPass;
    var RealName = req.body.RealName;
    var RealSurName = req.body.RealSurName;

    var user = {};

    if(NewUserEmail) {
        try {
            MongoClient.connect(DBurl, (db) => {

                console.log("Connection to db: " + DBurl );
                var collection = db.collection("users");
                collection.find({"UserEmail": NewUserEmail}).limit(1).toArray((err,result) => {
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
        } catch (e) {
            console.log(e);
        }
    }
    if(NewPass){
        try {
            MongoClient.connect(DBurl, (err,db) => {
                if(err) {
                    console.log("Error", err);
                } else {
                    console.log("Connection to db: " + DBurl);
                    var collection = db.collection("users");
                    collection.find({"UserEmail" : UserEmail, "password": OldPass}).limit(1).toArray((err, result) => {
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
        } catch (e) {
            console.log(e);
        }

    }
    if(RealName) {
        try {
            MongoClient.connect(DBurl, (err,db) => {
                if(err) {
                    console.log(err)
                } else {
                    console.log("Connection to db: " + DBurl);
                    var collection = db.collection("users");
                    collection.find({"UserEmail" : UserEmail}).limit(1).toArray((err, result) => {
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
        } catch (e) {
            console.log(e);
        }
    }
});*/
app.use('/delete', deleteS);


app.listen(config.port, () => {
    console.log('Server start on port ' + config.port);
   
});
module.exports = app;

