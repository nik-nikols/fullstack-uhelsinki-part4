const { test, describe, after, beforeEach } = require('node:test');
const assert = require('node:assert');

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('../utils/test_helper');

const api = supertest(app);

const login = async (username) => {
    const password = `${username} password`;
    const user = { username, password };
    const loginResult = await api
        .post('/api/login')
        .send(user);

    return loginResult.body;
};

beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    // Add users
    let promiseArray = helper.initialUsers.map(async user => {
        const newUser = {
            username: user.username,
            name: user.name,
            password: `${user.username} password`
        };

        return await api
        .post('/api/users')
        .send(newUser)
    });
    await Promise.all(promiseArray);

    // Add blogs
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    promiseArray = helper.initialBlogs.map(async blog => {

        return await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .send(blog)
    });
    await Promise.all(promiseArray);
});

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test('blog unique identifier is defined as id', async () => {
    const response = await api.get('/api/blogs');
    const firstBlog = response.body[0];

    assert(firstBlog.id);
});

test('a valid blog add fails if token not provided', async () => {
    const newTitle = 'New Blog added by api test';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        url: 'http://tempuri.org/blog#new',
        likes: 30
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test('a valid blog can be added', async () => {
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    const newTitle = 'New Blog added by api test';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        url: 'http://tempuri.org/blog#new',
        likes: 30
    };

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const contents = blogsAtEnd.map(blog => blog.title);

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert(contents.includes(newTitle));
});

test('likes defaults to 0 if missing in a new blog', async () => {
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    const newTitle = 'New Blog added by api test with missing likes';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        url: 'http://tempuri.org/blog#new'
    };

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const addedBlog = blogsAtEnd.find(blog => blog.title === newTitle);

    assert.strictEqual(addedBlog.likes, 0);
});

test('adding blog with missing title returns 400 status', async () => {
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    const newBlog = {
        author: 'Author New',
        url: 'http://tempuri.org/blog#new',
        likes: 30
    };

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .send(newBlog)
        .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test('adding blog with missing url returns 400 status', async () => {
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    const newTitle = 'New Blog added by api test with missing url';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        likes: 40
    };

    await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .send(newBlog)
        .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test('delete existing blog', async () => {
    const username = helper.initialUsers[0].username;
    const loginResult = await login(username);
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

    const ids = blogsAtEnd.map(blog => blog.id);
    assert(!ids.includes(blogToDelete.id));
});

test('delete existing blog that belongs to other user fails with status 403', async () => {
    const username = helper.initialUsers[1].username;
    const loginResult = await login(username);
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${loginResult.token}`})
        .expect(403);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

    const ids = blogsAtEnd.map(blog => blog.id);
    assert(ids.includes(blogToDelete.id));
});

test('update existing blog with valid data suceeds', async () => {
    const updatedLikes = 101;
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    blogToUpdate.likes = updatedLikes;

    const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    assert.strictEqual(updatedBlog.body.likes, updatedLikes);

    const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
    assert.strictEqual(updatedBlogInDb.likes, updatedLikes);
});

test('update existing blog with invalid data fails with status 400', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const firstBlog = blogsAtStart[0];
    const blogToUpdate = {
        title: null,
        author: 'My Test Author here',
        likes: firstBlog.likes + 100,
        id: firstBlog.id
    };

    const result = await api.put(`/api/blogs/${firstBlog.id}`)
        .send(blogToUpdate)
        .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

    const blogInDb = blogsAtEnd.find(blog => blog.id === firstBlog.id);
    assert.strictEqual(blogInDb.author, firstBlog.author);
    assert.strictEqual(blogInDb.likes, firstBlog.likes);
});

after(async () => {
    await mongoose.connection.close();
});

