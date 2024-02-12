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
    if (blogs && blogs.length > 0) {
        blogs.sort((a, b) => {
            return (b.likes - a.likes);
        });

        return blogs[0];
    }

    return null;
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
};
