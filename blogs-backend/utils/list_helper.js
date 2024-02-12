const _ = require('lodash');

const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum += item.likes;
    };

    return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
    if (blogs?.length) {
        const sorted = _.sortBy(blogs, [(blog) => -blog.likes]);

        return sorted[0];
    }

    return null;
};

const mostBlogs = (blogs) => {
    if (blogs?.length) {
        if (blogs.length === 1) {
            return { author: blogs[0].author, blogs: 1 };
        }

        const counted = _.countBy(blogs, 'author');
        let author = '';
        let count = 0;

        for (const key in counted) {
            if (counted[key] > count) {
                count = counted[key];
                author = key;
            }
        }

        return { author: author, blogs: count };
    }

    return null;
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
};
