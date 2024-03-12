const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: 'First Blog',
        author: 'Author 1',
        url: 'http://tempuri.org/blog#1',
        likes: 10
    },
    {
        title: 'Second Blog',
        author: 'Author 2',
        url: 'http://tempuri.org/blog#2',
        likes: 20
    }

];

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map(blog => blog.toJSON());
};

const initialUsers = [
    {
        username: 'testuser',
        name: 'Test User',
        passwordHash: 'test password'
    },
    {
        username: 'testuser2',
        name: 'Test User 2',
        passwordHash: 'test 2 password'
    }
];

const usersInDb = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
};

module.exports = {
    initialBlogs,
    initialUsers,
    blogsInDb, 
    usersInDb
};