const { ObjectId } = require('bson')
const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOneId,
    userTwoId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should fetch all user tasks', async() => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Should fetch user task by id', async() => {
    await request(app)
        .get('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async() => {
    await request(app)
        .get('/tasks/' + taskOne._id)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async() => {
    await request(app)
        .get('/tasks/' + taskThree._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async() => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body).not.toMatchObject([
        { completed: false },
    ])
})

test('Should fetch only incomplete tasks', async() => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body).not.toMatchObject([
        { completed: true },
    ])
})

test('Should sort tasks by description', async() => {
    // description
    const response = await request(app)
        .get('/tasks?sortBy=description:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response.body[0]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response.body[1]._id)).toEqual(new ObjectId(taskTwo._id))

    const response2 = await request(app)
        .get('/tasks?sortBy=description:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response2.body[1]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response2.body[0]._id)).toEqual(new ObjectId(taskTwo._id))
})

test('Should sort tasks by completed', async() => {
    // completed
    const response = await request(app)
        .get('/tasks?sortBy=completed:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response.body[0]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response.body[1]._id)).toEqual(new ObjectId(taskTwo._id))

    const response2 = await request(app)
        .get('/tasks?sortBy=completed:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response2.body[1]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response2.body[0]._id)).toEqual(new ObjectId(taskTwo._id))
})

test('Should sort tasks by createdAt', async() => {
    // createdAt
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response.body[0]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response.body[1]._id)).toEqual(new ObjectId(taskTwo._id))

    const response2 = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response2.body[1]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response2.body[0]._id)).toEqual(new ObjectId(taskTwo._id))
})

test('Should sort tasks by updatedAt', async() => {
    // updatedAt
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response.body[0]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response.body[1]._id)).toEqual(new ObjectId(taskTwo._id))

    const response2 = await request(app)
        .get('/tasks?sortBy=updatedAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(new ObjectId(response2.body[1]._id)).toEqual(new ObjectId(taskOne._id))
    expect(new ObjectId(response2.body[0]._id)).toEqual(new ObjectId(taskTwo._id))
})

test('Should fetch page of tasks', async() => {
    const response = await request(app)
        .get('/tasks?limit=2&skip=0')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)

    const response2 = await request(app)
        .get('/tasks?limit=1&skip=0')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response2.body.length).toBe(1)

    const response3 = await request(app)
        .get('/tasks?limit=1&skip=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response3.body.length).toBe(1)
    expect(response2.body).not.toEqual(response3.body)

    // expect(response2.body._id).toEqual(taskOne._id)

})

test('Should create task for user', async() => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    // checking the default value to be false
    expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description/completed', async() => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: false
        })
        .expect(400)
})

test('Should not update other users task', async() => {
    await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should delete user task', async() => {
    await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not delete other users tasks', async() => {
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async() => {
    await request(app)
        .delete('/tasks/' + taskOne._id)
        .send()
        .expect(401)
})

// links.mead.io/extratests