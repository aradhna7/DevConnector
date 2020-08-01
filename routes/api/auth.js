const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator/check');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    TEST ROUTE
// @access  PUBLIC
router.get('/', auth, async(req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);

  }catch(err){
    console.log(err.message);
    res.status(500).send('server error');
  }
});


// @route   POST api/auth
// @desc    authenticate user and get token
// @access  PUBLIC
router.post('/', [
  check('email','enter a valid email').isEmail(),
  check('password','Password is required').exists()

] , async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() })
  }

  const {name , email , password} = req.body;
  try{

    //SEE IF USER EXISTS
    let user = await User.findOne({email});

    if(!user){
      return res.status(400).json({ errors : [{ msg : "Invalid credentials" }]});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.status(400).json({ errors : [{ msg : "Invalid credentials" }]});
    }

    //RETURN JSWEBTOKEN---------
    const payload = {
      user : {
        id : user.id
      }
    };

    jwt.sign(payload, config.get('jwtSecret'),{expiresIn:3600000},
      (err, token)=>{
        if(err) throw err;
      
        res.json({ token });
      }
    );

    

  }catch(err){
    console.error(err.message);
    res.status(500).send('server error');
  }
  // res.send('users route');

});

module.exports = router;
