const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
});

describe('total likes', () => {
    test('of empty list is zero', () => {
        expect(listHelper.totalLikes([])).toBe(0);
    });

    test('when list has only one blogequals the likes of that', () => {
        const blog = { likes: 10 };
        expect(listHelper.totalLikes([blog])).toBe(blog.likes);
    });

    test('of a bigger list is calculated right', () => {
        const blogs = [
            { likes: 10 },
            { likes: 7 },
        ];
        expect(listHelper.totalLikes(blogs)).toBe(17);
    });
});