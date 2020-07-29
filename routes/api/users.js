const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    TEST ROUTE
// @access  PUBLIC
router.get('/', (req, res) => {
  res.send('users route');
});

module.exports = router;
