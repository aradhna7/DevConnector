const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post= require('../../models/Post');
const User= require('../../models/User');
const Profile= require('../../models/Profile');


// @route   POST api/posts
// @desc    CREATE A POST
// @access  PRIVATE
router.post('/',[auth, [
  check('text','Text is required').not().isEmpty()
]], async(req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  try{
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })

    const post = await newPost.save();

    res.json(post);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

  
});


// @route   GET api/posts
// @desc    GET ALL POSTS
// @access  PRIVATE
router.get('/', auth, async(req, res) => {

  try{
    const posts = await Post.find().sort({ date:-1});

    res.json(posts);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

  
});



// @route   GET api/posts/:postid
// @desc    GET post by id
// @access  PRIVATE
router.get('/:postid', auth, async(req, res) => {

  try{
    const post = await Post.findById(req.params.postid);

    if(!post){
      return res.status(404).json({msg:'Post not found'});
    }

    res.json(post);

  }catch(err){
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg:'Post not found'});
    }

    return res.status(500).send('Server error');
  }

  
});



// @route   DELETE api/posts/:postid
// @desc    DELETE post by id
// @access  PRIVATE
router.delete('/:postid', auth, async(req, res) => {

  try{
    const post = await Post.findById(req.params.postid);
    if(!post){
      return res.status(404).json({msg:'Post not found'});
    }


    if(post.user.toString() !== req.user.id){
      return res.status(401).json({msg:'User not autherized'});
    }

    await post.remove();

    res.json({ msg:'Post removed'});

  }catch(err){
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg:'Post not found'});
    }

    return res.status(500).send('Server error');
  }
});




// @route   PUT api/posts/like/:postid
// @desc    Like a post
// @access  PRIVATE
router.put('/like/:postid', auth, async(req, res) => {

  try{
    const post = await Post.findById(req.params.postid);
    
    //CHECK IF THE POST IS ALREADY BEEN LIKED
    if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
      return res.status(400).json({msg:'Post already liked'});
    }

    post.likes.unshift({ user:req.user.id });

    await post.save();

    res.json(post.likes);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});



// @route   PUT api/posts/unlike/:postid
// @desc    Like a post
// @access  PRIVATE
router.put('/unlike/:postid', auth, async(req, res) => {

  try{
    const post = await Post.findById(req.params.postid);
    
    //CHECK IF THE POST IS ALREADY BEEN LIKED
    if(post.likes.filter(like => like.user.toString() === req.user.id).length===0){
      return res.status(400).json({msg:'Post has not yet been liked'});
    }

    //GET REMOVE INDEX
    const removeIndex= post.likes.map(like=> like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});




// @route   POST api/posts/comment/:postid
// @desc    Comment on a post
// @access  PRIVATE
router.post('/comment/:postid',[auth, [
  check('text','Text is required').not().isEmpty()
]], async(req, res) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  try{
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.postid);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

  
});



// @route   DELETE api/posts/comment/:postid/:commentid
// @desc    Delete Comment on a post
// @access  PRIVATE
router.delete('/comment/:postid/:commentid', auth, async(req, res) => {

  try{
    const post = await Post.findById(req.params.postid);

    //PULL OUT COMMENT
    const comment = post.comments.find(comment=> comment.id===req.params.commentid);

    //MAKE SURE COMMENT EXISTS
    if(!comment){
      return res.status(404).json({msg:'Comment does not exist'});
    }


    if(comment.user.toString()!== req.user.id){
      return res.status(401).json({msg:'User not authorized'});
    }


    //GET REMOVE INDEX
    const removeIndex= post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);

  }catch(err){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

  
});

module.exports = router;
