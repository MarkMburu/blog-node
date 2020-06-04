const express = require('express')
const UserEntry = require('./../models/user')
const router = express.Router()

// saving user signup page data
router.post('/signup',async(req,res,next)=>{
  try {
    // initializing the schema and saving data gotten from the signup page
    const userEntry = new UserEntry(req.body);
    const createdEntry = await userEntry.save();
    res.redirect('/signin');
  } catch (error) {
    // handling error
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
})

// signin and vrifying whether user exist
router.post('/signin',(req,res)=>{
  let {email,password} = req.body;
   UserEntry.findOne({email:email,password:password},(err,user)=>{
    if(err){
      // handling error
      console.log(err)
      return res.status(500).send();
    }
    if(!user){
      // redirects to signup page if the user doesnot exist
      console.log('user not found')
      // status 404 is page not found
      return res.status(404).redirect('/signup')
    }
    // setting the user has signedin to true
    // status 2000 is ok
     return res.status(200).redirect('/')
  })
})
