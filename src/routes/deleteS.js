import express from 'express';
const router = express.Router();

var deleteS = router.post('/', (req, res) => {
    console.log("Session destroyed");
    req.session.destroy();
    res.clearCookie('btnExit')
        .send("del");
});
module.exports = deleteS;