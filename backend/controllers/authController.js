const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const result = await authService.registerCustomer({ name, email, password });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
