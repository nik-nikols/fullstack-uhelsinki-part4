const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('../utils/test_helper');

const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({});
    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
    const promiseArray = blogObjects.map(blog => blog.save());
    await Promise.all(promiseArray);
});

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('blog unique identifier is defined as id', async () => {
    const response = await api.get('/api/blogs');
    const firstBlog = response.body[0];

    expect(firstBlog.id).toBeDefined();
});

afterAll(async () => {
    await mongoose.connection.close();
});

