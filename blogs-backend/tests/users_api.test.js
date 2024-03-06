const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('../utils/test_helper');

const api = supertest(app);


beforeEach(async () => {
    await User.deleteMany({});
    const userObjects = helper.initialUsers.map(user => new User(user));
    const promiseArray = userObjects.map(user => user.save());
    await Promise.all(promiseArray);
});

describe('create users', () => {
    test('a valid user can be created', async () => {
        const newUsername = 'testuserNew';
        const newUser = {
            username: newUsername,
            name: 'New User',
            password: 'Test New User Password'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        const contents = usersAtEnd.map(user => user.username);

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1);
        assert(contents.includes(newUsername));
    });

    test('username must be unique', async () => {
        const existingUsername = helper.initialUsers[0].username;

        const newUser = {
            username: existingUsername,
            name: 'New User',
            password: 'Test New User Password'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await helper.usersInDb();

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
        assert.strictEqual(response.body.error, 'expected `username` to be unique');
    });

    test('username is required', async () => {
        const newUser = {
            name: 'New User',
            password: 'Test New User Password'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await helper.usersInDb();

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
        assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` is required.');
    });

    test('username must be at least 3 characters long', async () => {
        const newUser = {
            username: 'ab',
            name: 'New User',
            password: 'Test New User Password'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await helper.usersInDb();

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
        assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` (`ab`) is shorter than the minimum allowed length (3).');
    });

    test('password is required', async () => {
        const newUser = {
            username: 'testanotherusernew',
            name: 'New User'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await helper.usersInDb();

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
        assert.strictEqual(response.body.error, 'password should be at least 3 characters long');
    });

    test('password must be at least 3 characters long', async () => {
        const newUser = {
            username: 'testanotherusernew',
            name: 'New User',
            password: 'ab'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        const usersAtEnd = await helper.usersInDb();

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
        assert.strictEqual(response.body.error, 'password should be at least 3 characters long');
    });
});

after(async () => {
    await mongoose.connection.close();
});