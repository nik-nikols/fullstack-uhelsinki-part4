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

test('a valid blog can be added', async () => {
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
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const conttents = blogsAtEnd.map(blog => blog.title);

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
    expect(conttents).toContain(newTitle);
});

test('likes defaults to 0 if missing in a new blog', async () => {
    const newTitle = 'New Blog added by api test with missing likes';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        url: 'http://tempuri.org/blog#new'
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const addedBlog = blogsAtEnd.find(blog => blog.title === newTitle);

    expect(addedBlog.likes).toBe(0);
});

afterAll(async () => {
    await mongoose.connection.close();
});

