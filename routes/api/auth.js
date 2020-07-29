const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @desc    TEST ROUTE
// @access  PUBLIC
router.get('/', (req, res) => {
  res.send('auth route');
});

module.exports = router;
