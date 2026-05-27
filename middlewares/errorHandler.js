const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console for development
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid resource ID format: ${err.value}`,
    });
  }

  // Mongoose Duplicate Key Error (e.g. unique email constraint)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      error: `Duplicate value entered for field(s): ${fields}. Please use a unique value.`,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const details = {};
    Object.keys(err.errors).forEach((key) => {
      details[key] = err.errors[key].message;
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: details,
    });
  }

  // General server error
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

module.exports = errorHandler;
