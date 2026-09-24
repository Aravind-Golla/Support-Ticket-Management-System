const userService = require('../services/userService');

async function listAgents(req, res, next) {
  try {
    const agents = await userService.listAgents();
    res.status(200).json({
      success: true,
      data: agents,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAgents };
