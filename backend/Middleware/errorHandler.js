module.exports = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource id.' });
  }

  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)[0]?.message || 'Validation failed.';
    return res.status(400).json({ success: false, message });
  }

  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate value provided.' });
  }

  console.error(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error.',
  });
};
