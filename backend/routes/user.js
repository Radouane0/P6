const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const limiter = require('../middleware/limiter');
const constroleEmail = require('../middleware/controleEmail');
const controlePassword = require('../middleware/controlePassword');

router.post('/signup', constroleEmail, controlePassword, userCtrl.signup);
router.post('/login', limiter, userCtrl.login);

module.exports = router;