import express from 'express';
import path from 'path';
const router = express.Router();

var deleteS = router.post('/', (req, res) => {
    console.log("Session destroyed");
    req.session.destroy();
    res.clearCookie('btnExit')
        .send(true);
});
module.exports = deleteS;