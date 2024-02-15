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

test('adding blog with missing title returns 400 status', async () => {
    const newBlog = {
        author: 'Author New',
        url: 'http://tempuri.org/blog#new',
        likes: 30
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('adding blog with missing url returns 400 status', async () => {
    const newTitle = 'New Blog added by api test with missing url';
    const newBlog = {
        title: newTitle,
        author: 'Author New',
        likes: 40
    };

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('delete existing blog', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const ids = blogsAtEnd.map(blog => blog.id);
    expect(ids).not.toContain(blogToDelete.id);
});

test('update existing blog with valid data suceeds', async () => {
    const updatedLikes = 101;
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    blogToUpdate.likes = updatedLikes;

    const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    expect(updatedBlog.body.likes).toBe(updatedLikes);

    const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
    expect(updatedBlogInDb.likes).toBe(updatedLikes);
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
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const blogInDb = blogsAtEnd.find(blog => blog.id === firstBlog.id);
    expect(blogInDb.author).toBe(firstBlog.author);
    expect(blogInDb.likes).toBe(firstBlog.likes);
});

afterAll(async () => {
    await mongoose.connection.close();
});

