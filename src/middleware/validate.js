const { validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: extractedErrors,
    });
  };
};

module.exports = validate;
