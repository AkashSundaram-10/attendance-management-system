const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific Prisma errors
  if (err.code === 'P2002') {
    return sendError(res, 400, 'Duplicate field value entered', err.meta?.target);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Your token has expired. Please log in again.');
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // Production Error Response
  if (err.isOperational) {
    sendError(res, err.statusCode, err.message);
  } else {
    console.error('ERROR 💥', err);
    sendError(res, 500, 'Something went wrong!');
  }
};

const notFound = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

module.exports = {
  errorHandler,
  notFound,
};
