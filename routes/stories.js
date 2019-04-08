const express = require('express');
// const nodemailer = require('nodemailer');
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();

const parser = require('../helpers/file-upload');

const User = require('../models/User');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const Challenge = require('../models/Challenge');
const { requireAnon, requireUser, requireFields, requireFieldsNewStory, requireFieldsStory } = require('../middlewares/auth');

/* GET home page. */

router.get('/list', requireUser, async (req, res, next) => {
  try {
    let stories = await Story.find({ lastStory: null });
    stories = reverseArray(stories);
    res.render('stories/list', { stories });
  } catch (error) {
    next(error);
  }
});

router.post('/list', (req, res, next) => {
  const {filter} = req.body;
  if(filter === 'All'){
    res.redirect(`/stories/list`);
    return;
  }
  res.redirect(`/stories/list/${filter}`);
});

router.post('/list/search', requireUser, (req, res, next) => {
  const {search} = req.body;
  if(!search){
    res.redirect(`/stories/list`);
    return;
  }
  res.redirect(`/stories/list/search/${search}`);
});

router.get('/list/search/:search', requireUser, async (req, res, next) => {
  const{search} = req.params;
  let stories = [];
  try {
    const user = await User.find({username: {"$regex": search, "$options": 'i'}});
    stories = await Story.find({title: {"$regex": search, "$options": 'i'}, lastStory:null});
    if(user){
      for(e of user){
        let storiesUserFound =  await Story.find({creator:e.id, publicCreator: 'true', lastStory:null});
        storiesUserFound.forEach(e=>{
          let inStories =false;
          stories.forEach(story=>{
            if(e.id === story.id){
              inStories = true;
            }
          });
          if(!inStories){
            stories.push(e);
          }
        });
      }
    }
    stories = reverseArray(stories);
    res.render('stories/list', { stories});
  } catch (error) {
    next(error);
  }
});

router.get('/list/:filter', requireUser, async (req, res, next) => {
  const{filter} = req.params;
  try {
    let stories = await Story.find({ lastStory: null, genre: filter});
    stories = reverseArray(stories);
    res.render('stories/list', { stories, filter });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, function (req, res, next) {
  const data = {
    messages: req.flash('validation')
  };
  res.render('stories/create', {data});
});

router.post('/new', requireUser, parser.single('image'), async (req, res, next) => {
  const {text, genre, title, challenge} = req.body;
  const story = {
    text,
    genre,
    title,
  };

  try {
    if(!title){
      req.flash('validation', 'Fill the title field');
      if(challenge){
        res.redirect(`/challenges/${challenge}/new`);
      }else{
        res.redirect(`/stories/new`);
      }
      return;
    }

    if(!text){
      req.flash('validation', 'You have to write a story');
      if(challenge){
        res.redirect(`/challenges/${challenge}/new`);
      }else{
        res.redirect(`/stories/new`);
      }
      return;
    }
    if(req.file){
      story.image = req.file.url;
    }
    if(challenge){
      story.challenge = challenge;
      story.votes = 0;
    }
    story.creator = req.session.currentUser._id;
    story.visits = 0;
    story.favorites = 0;

    const newStory = await Story.create(story);
    await Story.findByIdAndUpdate(newStory.id, {set: newStory.id});

    if(!challenge){
      res.redirect('/stories/my-stories');
      return;
    }else{
      res.redirect('/challenges/my-challenges');
    }
    
  } catch (error) {
    next(error);
  };
});

router.get('/ranking', requireUser, async (req, res, next) => {
  try {
    let stories = await Story.find({challenge: { $ne: null }, votes:{$ne: 0}}).sort({votes:-1}).limit(5);
    res.render('stories/ranking', { stories });
  } catch (error) {
    next(error);
  }
});

router.get('/favorites', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    const user = await User.findById(_id);
    let stories = [];
    for(favorite of user.favorites){
      const story = await Story.findById(favorite);
      if(story){
        stories.push(story);
      }
    } 
    stories = reverseArray(stories);
    res.render('stories/favorites', { stories });
  } catch (error) {
    next(error);
  }
});


router.get('/my-stories', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    // const tortilla = await Tortilla.findById(id).populate('creator');
    let stories = await Story.find({ creator: _id, lastStory: null });
    stories = reverseArray(stories);
    res.render('stories/my-stories', { stories });
  } catch (error) {
    next(error);
  }
});

router.post('/my-stories', requireUser, (req, res, next) => {
  const {filter} = req.body;
  if(filter === 'All'){
    res.redirect(`/stories/my-stories`);
    return;
  }
  res.redirect(`/stories/my-stories/${filter}`);
});

router.get('/my-stories/:filter', requireUser, async (req, res, next) => {
  const{filter} = req.params;
  try {
    let stories = await Story.find({ lastStory: null, genre: filter});
    stories = reverseArray(stories);
    res.render('stories/my-stories', { stories, filter });
  } catch (error) {
    next(error);
  }
});

router.post('/add-favorite', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    const userUpdated = await User.findByIdAndUpdate(_id, {$push:{favorites:id}}, {new:true});
    const story = await Story.findById(id);
    let favorites = story.favorites;
    favorites++;
    await Story.findByIdAndUpdate(id, {favorites});
    req.session.currentUser = userUpdated;
    res.json(userUpdated);

  } catch (error) {
    next(error);
  };
});

router.post('/add-vote', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    let story = await Story.findById(id);
    const user = await User.findByIdAndUpdate(_id, {$push:{voted:id}});
    let votes = story.votes;
    votes++;
    story = await Story.findByIdAndUpdate(id, {votes});
    res.json(votes);
  } catch (error) {
    next(error);
  };
});

router.post('/remove-favorite', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    const userUpdated = await User.findByIdAndUpdate(_id, {$pull:{favorites:id}}, {new:true});
    const story = await Story.findById(id);
    let favorites = story.favorites;
    favorites--;
    await Story.findByIdAndUpdate(id, {favorites});
    req.session.currentUser = userUpdated;
    res.json(userUpdated);

  } catch (error) {
    next(error);
  };
});


router.get('/:id', requireUser, parser.single('image'), async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const story = await Story.findById(id).populate('creator');
    const comments = await Comment.find({story: id}).populate('creator');
    const challenge = await Challenge.findById(story.challenge);
    let visits = story.visits;
    visits++;
    await Story.findByIdAndUpdate(id, {visits});
    let isCreator = false;
    let hasVoted = false;
    let isFavorite = false;
    if(_id){
      const user = await User.findById(_id);
      user.voted.forEach(element => {
        if (id === element){
          hasVoted = true;
        }
      });
    }else{
      hasVoted = true;
    }
    if(_id){
      const user = await User.findById(_id);
      user.favorites.forEach(element => {
        if (id === element){
          isFavorite = true;
        }
      });
    }else{
      isFavorite = true;
    }
    if (story.creator.equals(_id)) {
      isCreator = true;
    }
    let isLast =false;
    if(!story.nextStory){
      isLast =true;
    }
    res.render('stories/details', { story, isCreator, hasVoted, isFavorite, isLast, comments, challenge, data });
  } catch (error) {
    next(error);
  };
});

router.get('/:id/edit', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const story = await Story.findById(id);
    if (!story.creator.equals(_id)) {
      res.redirect('/stories/list');
      return;
    }
    res.render('stories/edit', { story, data });
  } catch (error) {
    next(error);
  };
});

router.post('/:id/edit', requireUser, requireFieldsStory, async (req, res, next) => {
  const {text} = req.body;
  const {id} = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const story = await Story.findById(id);
    if (!story.creator.equals(_id)) {
      res.redirect('/stories/list');
      return;
    }
    await Story.findByIdAndUpdate(id, {text});
    res.redirect('/stories/my-stories');
  } catch (error) {
    next(error);
  };
});

router.get('/:id/continue', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const story = await Story.findById(id);
    if (!story.creator.equals(_id)) {
      res.redirect('/stories/list');
      return;
    }
    res.render('stories/continue', { story, data });
  } catch (error) {
    next(error);
  };
});

router.post('/:id/continue', requireUser, parser.single('image'), requireFieldsStory, async (req, res, next) => {
  const { text, title, set} = req.body;
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
      const storyParent = await Story.findById(id); 
      const lastStory = await Story.findOne({set, nextStory: null});
      if (!(storyParent.creator.equals(_id))) {
        res.redirect(`/stories/${id}`);
        return;
      }
      let story = {
        text,
        genre : storyParent.genre,
        title,
        set : storyParent.set,
        lastStory: lastStory.id, 
      };

      if(req.file){
        story.image = req.file.url;
      }
      story.creator = _id;
      story.visits = 0;
      story.favorites = 0;
      if(storyParent.challenge){
        story.challenge = storyParent.challenge;
        story.votes = 0;
      }
      const newStory = await Story.create(story);
      await Story.findByIdAndUpdate(lastStory.id, {nextStory: newStory.id});
      
    res.redirect(`/stories/${newStory.id}`);
  } catch (error) {
    next(error);
  };
});

router.get('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  if(!ObjectId.isValid(id)){
    return next();
  }
  res.render('stories/delete', { id });
});

router.post('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const story = await Story.findById(id);
    if (!story.creator.equals(_id)) {
      res.redirect('/stories/list');
      return;
    }
    const nextStory = await Story.findById(story.nextStory);
    const lastStory = await Story.findById(story.lastStory);
    if(lastStory && nextStory){
      await Story.findByIdAndUpdate(story.lastStory, {nextStory: nextStory.id});
      await Story.findByIdAndUpdate(story.nextStory, {lastStory: lastStory.id});
    } else if(nextStory && !lastStory){
      await Story.findByIdAndUpdate(story.nextStory, {lastStory: null});
    } else if(!nextStory && lastStory){
      await Story.findByIdAndUpdate(story.lastStory, {nextStory: null});
    }
    await Story.findByIdAndDelete(id);
    res.redirect('/stories/my-stories');
  } catch (error) {
    next(error);
  };
});

router.post('/:id/comment', requireUser, async (req, res, next) => {
  const {id} = req.params;
  const {text} = req.body;
  const comment = {text};
  const {_id} = req.session.currentUser;

  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    comment.creator = _id;
    comment.story = id;
    const commentWritten = await Comment.create(comment);
    const user = await User.findById(_id);
    const infoResponse = [user.username, commentWritten.text];
    res.json(infoResponse);
  } catch (error) {
    next(error);
  };
});


function reverseArray(arr){
  let newArr = [];
  for(let i = arr.length-1; i>=0; i--){
    newArr.push(arr[i]);
  }

  return newArr;
}


// function emailTransporter(){
//   let transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: 'app.justsayit@gmail.com',
//       pass: 'ironproyecto2'
//     }
//   });

//   return transporter;
// }

module.exports = router;
