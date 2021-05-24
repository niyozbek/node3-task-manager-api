const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

// afterEach(() => {
//     console.log('afterEach')
// })

test('Should signup a new user', async() => {
    // invalid name
    await request(app).post('/users').send({
        // name: undefined,
        email: 'imniyozbek@example.com',
        password: 'asdasd!'
    }).expect(400)

    // invalid email
    await request(app).post('/users').send({
        name: 'Niyozbek',
        email: 'imniyozbek@@.com',
        password: 'MyPass77777!'
    }).expect(400)

    // invalid password
    await request(app).post('/users').send({
        name: 'Niyozbek',
        email: 'imniyozbek@example.com',
        password: 'asdd!'
    }).expect(400)

    const response = await request(app).post('/users').send({
        name: 'Niyozbek',
        email: 'imniyozbek@example.com',
        password: 'MyPass77777!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Niyozbek',
            email: 'imniyozbek@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass77777!')



})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async() => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'wrongasdas'
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete user if unauthenticated', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/images/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)

    // use toEqual with objects, which is ==; toBe is ===
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Test"
        })
        .expect(200)

    const user = await User.findById(userOneId)
        // use toEqual with objects
    expect(user.name).toBe('Test')
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Test"
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async() => {
    await request(app)
        .patch('/users/me')
        .send({
            name: "Test"
        })
        .expect(401)
})

test('Should not update user with invalid name/email/password', async() => {
    // email
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: "Test@@.com"
        })
        .expect(400)
        // password
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: "one"
        })
        .expect(400)
})