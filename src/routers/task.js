const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async(req, res) => {
    const task = new Task({
        // body + user._id
        ...req.body,
        owner: req.user._id
    })

    try {
        const result = await task.save()
        res.status(201).send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc

router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        // const tasks = await Task.find({ owner: req.user._id })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }

    // Task.find({}).then((task) => {
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }

    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdated = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdated.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((updateField) => task[updateField] = req.body[updateField])

        await task.save()

        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router