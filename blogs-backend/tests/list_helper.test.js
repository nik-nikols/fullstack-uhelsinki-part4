const { test, describe } = require('node:test');
const assert = require('node:assert');

const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    assert.strictEqual(result, 1);
});

describe('total likes', () => {
    test('of empty list is zero', () => {
        assert.strictEqual(listHelper.totalLikes([]), 0);
    });

    test('when list has only one blog equals the likes of that', () => {
        const blog = { likes: 10 };
        assert.strictEqual(listHelper.totalLikes([blog]), blog.likes);
    });

    test('of a bigger list is calculated right', () => {
        const blogs = [
            { likes: 10 },
            { likes: 7 },
        ];
        assert.strictEqual(listHelper.totalLikes(blogs), 17);
    });
});

describe('favorite blog', () => {
    test('of empty list returns null', () => {
        assert.equal(listHelper.favoriteBlog([]), null);
    });

    test('when list has only one blog equals that', () => {
        const blog = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };
        assert.deepStrictEqual(listHelper.favoriteBlog([blog]), blog);
    });

    test('of a bigger list is calculated right', () => {
        const blog1 = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };

        const blog2 = {
            title: 'Blog 2',
            author: 'Author 2',
            url: 'url2',
            likes: 7 
        };

        const blog3 = {
            title: 'Blog 3',
            author: 'Author 3',
            url: 'url3',
            likes: 28 
        };

        const blogs = [blog1, blog2, blog3];
        assert.deepStrictEqual(listHelper.favoriteBlog(blogs), blog3);
    });
});

describe('most blogs', () => {
    test('of empty list returns null', () => {
        assert.strictEqual(listHelper.mostBlogs([]), null);
    });

    test('when list has only one blog equals that author and count 1', () => {
        const blog = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };
        assert.deepStrictEqual(listHelper.mostBlogs([blog]), { author: blog.author, blogs: 1 });
    });

    test('of a bigger list is calculated right', () => {
        const blog1 = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };

        const blog2 = {
            title: 'Blog 2',
            author: 'Author 2',
            url: 'url2',
            likes: 7 
        };

        const blog3 = {
            title: 'Blog 3',
            author: 'Author 3',
            url: 'url3',
            likes: 28 
        };

        const blog4 = {
            title: 'Blog 4',
            author: 'Author 1',
            url: 'url4',
            likes: 10 
        };

        const blog5 = {
            title: 'Blog 5',
            author: 'Author 1',
            url: 'url5',
            likes: 10 
        };

        const blog6 = {
            title: 'Blog 6',
            author: 'Author 3',
            url: 'url6',
            likes: 28 
        };

        const blogs = [blog1, blog2, blog3, blog4, blog5, blog6];
        assert.deepStrictEqual(listHelper.mostBlogs(blogs), { author: 'Author 1', blogs: 3 });
    });
});

describe('most likes', () => {
    test('of empty list returns null', () => {
        assert.strictEqual(listHelper.mostLikes([]), null);
    });

    test('when list has only one blog equals that author and likes', () => {
        const blog = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };
        assert.deepStrictEqual(listHelper.mostLikes([blog]), { author: blog.author, likes: blog.likes });
    });

    test('of a bigger list is calculated right', () => {
        const blog1 = {
            title: 'Blog 1',
            author: 'Author 1',
            url: 'url1',
            likes: 10 
        };

        const blog2 = {
            title: 'Blog 2',
            author: 'Author 2',
            url: 'url2',
            likes: 7 
        };

        const blog3 = {
            title: 'Blog 3',
            author: 'Author 3',
            url: 'url3',
            likes: 28 
        };

        const blog4 = {
            title: 'Blog 4',
            author: 'Author 1',
            url: 'url4',
            likes: 10 
        };

        const blog5 = {
            title: 'Blog 5',
            author: 'Author 1',
            url: 'url5',
            likes: 10 
        };

        const blog6 = {
            title: 'Blog 6',
            author: 'Author 3',
            url: 'url6',
            likes: 28 
        };

        const blogs = [blog1, blog2, blog3, blog4, blog5, blog6];
        assert.deepStrictEqual(listHelper.mostLikes(blogs), { author: 'Author 3', likes: 56 });
    });
});