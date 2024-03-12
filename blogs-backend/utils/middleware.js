const logger = require('./logger')


const getTokenFrom = request => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }

    return null;
};

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method);
    logger.info('Path:', request.path);
    logger.info('Body:', request.body);
    logger.info('---');
    next();
}

const unknownEndpoint = (request, response) =>{
    response.status(404).send({ error: 'unknown endpoint' });
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        response.status(400).send({ error: error.message });
    }
    else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).send({ error: 'expected `username` to be unique' });
    }
    else if (error.name === 'JsonWebTokenError') {
        response.status(400).send({ error: 'token missing or invalid' });
    }

    next(error);
}

const tokenExtractor = (request, response, next) => {
    request.token = getTokenFrom(request);

    next();
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}

