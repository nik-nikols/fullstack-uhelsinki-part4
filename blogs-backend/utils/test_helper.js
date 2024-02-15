const Blog = require('../models/blog');

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

module.exports = {
    initialBlogs,
    blogsInDb
};