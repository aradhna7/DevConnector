const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator/check');

const User= require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  PUBLIC
router.post('/', [
    check('name','name is required').not().isEmpty(),
    check('email','enter a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({min:6})

  ] , async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() })
    }

    const {name , email , password} = req.body;
    try{

      //SEE IF USER EXISTS
      let user = await User.findOne({email});

      if(user){
        return res.status(400).json({ errors : [{ msg : "user already exists" }]});
      }

      //USER GRAVATAR
      const avatar= gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
      });

      //CREATE NEW USER
      user = new User({
        name,
        email,
        password,
        avatar
      });

      //ENCRYPT PASSWORD
      const salt = await bcrypt.genSalt(10);
      
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //RETURN JSWEBTOKEN---------

      res.send('User Registered');

    }catch(err){
      console.error(err.message);
      res.status(500).send('server error');
    }
    res.send('users route');

});

module.exports = router;
