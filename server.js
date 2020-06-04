const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const path = require('path');
const Article = require('./models/article')
const UserEntry = require('./models/user')
const articleRouter = require('./routes/articles')
const userRouter = require('./routes/users')
const methodOverride = require('method-override')
const app = express()

const TWO_HOURS = 1000 * 60 * 60 * 2;

const{
  PORT = 5055,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET='ssh!quiet,it\'asecret!',
  SESS_LIFETIME = TWO_HOURS,
} =process.env;

const IN_PROD = NODE_ENV === 'production';

app.use(session({
  name:SESS_NAME,
  resave:false,
  saveUninitialized:false,
  secret: SESS_SECRET,
  cookie:{
    maxAge: SESS_LIFETIME,
    sameSite: true, //can also be set to strict.
    secure:IN_PROD
  }
}));

const redirectLogin = (req,res,next)=> {
  if(!req.session.userId){
    res.redirect('/signin')
  }
  else{
    next()
  }
}

const redirectHome = (req,res,next)=> {
  if(req.session.userId){
    res.redirect('/home')
  }
  else{
    next()
  }
}




mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

app.use('/articles', articleRouter)

// getting signup page
app.get('/signup',(req,res)=>{
  res.render('user/register')
});
// getting signin page
app.get('/signin',(req,res)=>{
  res.render('user/login')
});

// saving user signup page data
app.post('/signup',async(req,res,next)=>{
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
app.post('/signin',(req,res)=>{
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

app.post('/logout',redirectLogin,(req,res)=>{
  req.session.destroy(err =>{
    if(err){
      return res.redirect('/home')
    }
    res.clearCookie(SESS_NAME)
    res.redirect('/login')
  })

})



app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));