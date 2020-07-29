const express = require('express');
const router = express.Router();

// @route   GET api/posts
// @desc    TEST ROUTE
// @access  PUBLIC
router.get('/', (req, res) => {
  res.send('posts route');
});

module.exports = router;
