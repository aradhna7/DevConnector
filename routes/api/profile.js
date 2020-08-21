const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const {check, validationResult, checkSchema} = require('express-validator/check');

// @route   GET api/profile/me
// @desc    GET CURRENT USER PROFILE
// @access  PRIVATE
router.get('/me', auth, async(req, res) => {
  try{
    const profile = await Profile.findOne({ user : req.user.id }).populate('user', ['name', 'avatar']);

    if(!profile){
      return res.status(400).json({ msg: 'No profile for this user'});
    }

    res.json(profile);

  }catch(err){
    console.log(err.message);
    res.status(500).send('server error');
  }
});


// @route   POST api/profile
// @desc    CREATE OR UPDATE USER PROFILE
// @access  PRIVATE
router.post('/', [ auth ,[
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()

]], async(req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() });
    };

    const {company, website, location, bio,status, skills, githubusername, youtube,facebook, twitter, instagram,linkedin} = req.body;
    
    //BUILD PROFILE OBJECT
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company= company;
    if(website) profileFields.website= website;
    if(location) profileFields.location= location;
    if(bio) profileFields.bio=bio;
    if(status) profileFields.status= status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill=> skill.trim());
    }

    profileFields.social = {};
    if(twitter) profileFields.social.twitter= twitter;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;


    try{
      let profile = await Profile.findOne({ user : req.user.id });

      if(profile){
          profile = await Profile.findOneAndUpdate(
          {user : req.user.id},
          { $set : profileFields },
          { new: true}
        );
        return res.json(profile);
      };

      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);

    }catch(err){
      console.log(err.message);
      res.status(500).send('server error');
    }
});



// @route   GET api/profile
// @desc    GET ALL PROFILES
// @access  PUBLIC
router.get('/', async(req, res) => {
  try{
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);

  }catch(err){
    console.log(err.message);
    res.status(500).send('server error');
  }
});


// @route   GET api/profile/user/:userid
// @desc    GET PROFILE BY USERID
// @access  PUBLIC
router.get('/user/:userid', async(req, res) => {
  try{
    const profile = await Profile.findOne({ user : req.params.userid }).populate('user', ['name', 'avatar']);

    if(!profile){
      return res.status(400).json({msg: 'Profile not found'});
    }

    res.json(profile);

  }catch(err){
    if(err.kind == 'ObjectId'){
      return res.status(400).json({msg: 'Profile not found'});

    }
    console.log(err.message);
    res.status(500).send('server error');
  }
});



// @route   DELETE api/profile
// @desc    DELETE PROFILE, POST, USER
// @access  PRIVATE
router.delete('/', auth, async(req, res) => {
  try{
    //remove user post
    await Post.deleteMany({user: req.user.id})

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id});

    //remove user
    await User.findOneAndRemove({ _id: req.user.id});

    res.json({msg: 'User deleted'});

  }catch(err){
    console.log(err.message);
    res.status(500).send('server error');
  }
});



// @route   PUT api/profile/experience
// @desc    add profile experience
// @access  PRIVATE
router.put('/experience', [auth , [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', "From Date is required").not().isEmpty()
]], async(req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
       return res.status(400).json({ errors: errors.array() })
    }

    const {title, company, location, from, to, current, description} = req.body;

    const newExp ={
      title, 
      company, 
      location, 
      from, 
      to, 
      current,
      description
    }

  try{
    const profile = await Profile.findOne({ user: req.user.id});

    profile.experience.unshift(newExp);

    await profile.save();

    res.json(profile);

  }catch(err){
    console.log(err.message);
    res.status(500).send('server error');
  }
});



// @route   DELETE api/profile/experience/:expid
// @desc    delete a profile experience
// @access  PRIVATE
router.delete('/experience/:expid', auth , async(req, res) => {

try{
  const profile = await Profile.findOne({ user: req.user.id});

  //GET REMOVE INDEX
  const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.expid);



  profile.experience.splice(removeIndex, 1);

  await profile.save();

  res.json(profile);

}catch(err){
  console.log(err.message);
  res.status(500).send('server error');
}
});



// @route   PUT api/profile/education
// @desc    add profile education
// @access  PRIVATE
router.put('/education', [auth , [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('from', "From Date is required").not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty()
]], async(req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array() })
  }

  const {school, degree, fieldofstudy, from, to, current, description} = req.body;

  const newEdu ={
    school, 
    degree, 
    fieldofstudy, 
    from, 
    to, 
    current,
    description
  }

try{
  const profile = await Profile.findOne({ user: req.user.id});

  profile.education.unshift(newEdu);

  await profile.save();

  res.json(profile);

}catch(err){
  console.log(err.message);
  res.status(500).send('server error');
}
});



// @route   DELETE api/profile/education/:eduid
// @desc    delete a profile education
// @access  PRIVATE
router.delete('/education/:eduid', auth , async(req, res) => {

try{
const profile = await Profile.findOne({ user: req.user.id});

//GET REMOVE INDEX
const removeIndex = profile.education.map(item => item.id).indexOf(req.params.eduid);



profile.education.splice(removeIndex, 1);

await profile.save();

res.json(profile);

}catch(err){
console.log(err.message);
res.status(500).send('server error');
}
});



// @route   get api/profile/github/:username
// @desc    get user repos from github
// @access  PUBLIC
router.get('/github/:username', async(req, res) => {

  try{

    const options ={
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get.githubClientId}&client_secret=${config.get.githubSecret}`,
      method:'GET',
      headers : {'user-agent': 'node.js'}
    }

    request(options, (error, response, body) => {
      if(error) console.log(error);

      if(response.statusCode !== 200){
        return res.status(400).json({ msg: 'No github profile found'});
      };

      res.json(JSON.parse(body));
    });
  
  
  }catch(err){
  console.log(err.message);
  res.status(500).send('server error');
  }
  });
module.exports = router;
