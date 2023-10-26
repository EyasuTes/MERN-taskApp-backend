const mongoose =require('mongoose')
const moment = require('moment'); // Import the moment.js library
const todoSchema =mongoose.Schema({
    text:{
        type: String,
        require: true
    },
    complete:{
        type: Boolean,
        default: false,
        require: true
    },
    createDate: {
        type:Date,
        default: Date.now
    },
    completeDate:{
        type:Date,
        default: Date.now,
        require:true

    },
    expand:{
        type:Boolean,
        default:false
    }
})

todoSchema.virtual('formattedCreateDate').get(function () {
    return moment(this.createDate).format('DD-MM-YYYY HH:mm:ss'); // Adjust the format as needed
});

module.exports =mongoose.model('Todo', todoSchema)