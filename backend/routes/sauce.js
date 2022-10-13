const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/stuff');

router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;