const commentService = require('../services/commentService');

async function list(req, res, next) {
  try {
    const comments = await commentService.listComments(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const comment = await commentService.addComment(req.params.id, req.user, (req.body || {}).comment);
    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
