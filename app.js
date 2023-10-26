require('dotenv').config()
const express =require('express')
const mongoose =require('mongoose')
const mongoURI = process.env.mongoUrl
const jwtKey=process.env.jwtKey
const User =require('./models/users')
const Todo =require('./models/todos')
const JWT =require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const cors =require('cors')
const bcrypt =require('bcrypt')
const moment = require('moment')

const app =express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());


mongoose.connect(mongoURI, {
    useNewUrlParser:true,
    useUnifiedTopology: true,
}).then(console.log('connected to mongodb'))

app.post('/users',authenticate, async (req,res)=>{
    
   

    // Continue with your route logic
    
    const users = await User.find({email:req.user.email}).populate('todos');
    
    res.json(users[0]);
})
function authenticate(req, res, next) {
    const token = req.header('Authorization');
   
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify and decode the JWT token
    JWT.verify(token.replace('Bearer ', ''), jwtKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Store the decoded user information in the request object
        req.user = decoded;

        // Continue with the next middleware or route handler
        next();
    });
}
app.get('/todos', async (req,res)=>{
    const todo=await Todo.find()
    res.json(todo)
})
app.post('/register', async (req,res)=>{
    const {email ,name , password } =req.body
    const errors= [];
    const user = await User.find({email:email})
    if(!email || !name || !password){
        errors.push({msg:'fill all the values'})
    }
    
    if(user[0]){
        errors.push({msg: "email already exists"})
    }
    if(errors.length>0){
        res.json(errors)
    }
    else{
        const hashed = await bcrypt.hash(password, 10)
        const newUser = new User({
            email,
            name,
            password:hashed,
            
            
        })
        await newUser.save()
        res.json(newUser)
    }
    
})
app.post('/login',async (req,res)=>{
    const {email, password}=req.body
    const user = await User.find({email:email}).populate('todos')
    console.log(user)
    let isMatch=true;
    if(user[0]){
        isMatch =await bcrypt.compare(password,user[0].password)
    }
    
    const errors =[]

    if(!email || !password){
        errors.push({msg:'put in all the values first'})
    }
    if(!user[0]){
        errors.push({msg:'User does not exist'})
        
    }
    else if(!isMatch){
        errors.push({msg:"incorrect password"})
    }
    if(errors.length>0){
        res.json(errors)
    }
    else{
        const token = await JWT.sign({
            email,
            password,
            id:user._id
        },jwtKey,{
            expiresIn: 3600000
        }
        )
        
        res.json({user:token})
    }
   
})




app.post('/createtodo/user/:id', async (req,res)=>{
    
    const {text,completeDate} =req.body
    const todo =new Todo({
        text,
        completeDate,
        
        
    })
    
    await todo.save()
    
    const user = await User.findById(req.params.id)
    await user.todos.push(todo._id);
    user.populate('todos');
    await user.save()
  
    res.json(user)
    
})
app.put('/editTodo/:id', async(req,res)=>{
    const todo = await Todo.findById(req.params.id)
    todo.complete=!todo.complete
    await todo.save();
    res.json(todo)
})

app.delete('/deletetodo/:id', async(req,res)=>{
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
  
      // Delete the todo from the database
      await todo.deleteOne();
  
      res.json({ message: 'Todo deleted successfully' });
})
app.put('/expand/:id', async(req,res)=>{
    const todo = await Todo.findById(req.params.id)
    todo.expand = !todo.expand
    await todo.save()
    res.json(todo)
})

app.listen(3001, console.log('server connected'))