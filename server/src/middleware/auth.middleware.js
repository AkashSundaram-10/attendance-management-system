const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  req.user = { id: 'dev-user', role: 'ADMIN' };
  return next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
