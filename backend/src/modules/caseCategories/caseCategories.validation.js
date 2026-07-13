const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value) =>
  typeof value === "string" && UUID_REGEX.test(value.trim());

const validateUuidParam =
  (paramName = "id") =>
  (req, res, next) => {
    const value = req.params[paramName];

    if (!value || !isValidUuid(value)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} must be a valid UUID`,
      });
    }

    next();
  };

const validateIncludeInactiveQuery = (req, res, next) => {
  const { include_inactive: includeInactive } = req.query;

  if (
    includeInactive === undefined ||
    includeInactive === null ||
    includeInactive === ""
  ) {
    return next();
  }

  if (includeInactive !== "true" && includeInactive !== "false") {
    return res.status(400).json({
      success: false,
      message: "include_inactive must be true or false",
    });
  }

  next();
};

const validateCreateCategory = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["name", "description"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { name, description } = body;

  if (name === undefined || name === null || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      message: "name is required",
    });
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return res.status(400).json({
      success: false,
      message: "name must not be empty",
    });
  }

  if (trimmedName.length > 150) {
    return res.status(400).json({
      success: false,
      message: "name must not exceed 150 characters",
    });
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "description must be a string when provided",
      });
    }
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["name", "description", "is_active"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { name, description, is_active: isActive } = body;

  if (
    name === undefined &&
    description === undefined &&
    isActive === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "At least one field must be provided",
    });
  }

  if (name !== undefined) {
    if (name === null || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "name must be a string when provided",
      });
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "name must not be empty",
      });
    }

    if (trimmedName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "name must not exceed 150 characters",
      });
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "description must be a string when provided",
      });
    }
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "is_active must be true or false",
    });
  }

  next();
};

const validateReplaceSpecialistCategories = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["category_ids"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { category_ids: categoryIds } = body;

  if (!Array.isArray(categoryIds)) {
    return res.status(400).json({
      success: false,
      message: "category_ids must be an array",
    });
  }

  const seen = new Set();

  for (const categoryId of categoryIds) {
    if (typeof categoryId !== "string" || !isValidUuid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Each category_ids entry must be a valid UUID",
      });
    }

    const normalized = categoryId.trim();

    if (seen.has(normalized)) {
      return res.status(400).json({
        success: false,
        message: "category_ids must not contain duplicate values",
      });
    }

    seen.add(normalized);
  }

  next();
};

module.exports = {
  validateUuidParam,
  validateIncludeInactiveQuery,
  validateCreateCategory,
  validateUpdateCategory,
  validateReplaceSpecialistCategories,
};
