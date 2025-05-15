const express = require('express');
const router = express.Router();
const { createPreference } = require('../controllers/paymentcontroller');

router.post('/create-preference', createPreference);

module.exports = router;
