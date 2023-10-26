const mongoose =require('mongoose')
const Schema =mongoose.Schema
const userSchema =mongoose.Schema({
    name:{
        type: String,
        require: true,
        default: ''
    },
    email:{
        type: String,
        require: true,
        default: ''
    },
    password: {
        type:String,
        require: true,
        default: ''
    },
    todos: [{
        type: Schema.Types.ObjectId,
        ref: 'Todo',
      }],
})

module.exports =mongoose.model('User', userSchema)