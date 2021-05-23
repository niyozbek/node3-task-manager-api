const mongoose = require('mongoose')
const validator = require('validator')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

// const myTask = new Task({
//     description: '            Go to the mall     ',
//     // completed: false,
// })

// myTask.save().then(() => {
//     console.log(myTask)
// }).catch((error) => {
//     console.log(error)
// })


// const me = new User({
//     name: 'Neyo',
//     email: 'IMNIYOZ@gmail.com',
//     password: '          asdd    ',
//     age: 22,
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })