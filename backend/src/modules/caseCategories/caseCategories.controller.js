const caseCategoriesService = require("./caseCategories.service");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Request failed." : error.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const parseIncludeInactive = (req) => {
  if (req.user.role !== "admin") {
    return false;
  }

  return req.query.include_inactive === "true";
};

const listCategories = async (req, res) => {
  try {
    const includeInactive = parseIncludeInactive(req);
    const categories = await caseCategoriesService.listCategories({
      includeInactive,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const allowInactive = req.user.role === "admin";
    const category = await caseCategoriesService.getCategoryById(req.params.id, {
      allowInactive,
    });

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await caseCategoriesService.createCategory({
      name: req.body.name,
      description: req.body.description,
    });

    createAuditLog({
      userId: req.user.id,
      action: "case_category_create",
      entityName: "case_category",
      entityId: category.id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await caseCategoriesService.updateCategory(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      is_active: req.body.is_active,
    });

    createAuditLog({
      userId: req.user.id,
      action: "case_category_update",
      entityName: "case_category",
      entityId: category.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getSpecialistCategories = async (req, res) => {
  try {
    const { specialistId } = req.params;

    if (req.user.role !== "admin" && req.user.id !== specialistId) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. You do not have permission",
      });
    }

    const includeInactiveCategories = req.user.role === "admin";
    const categories = await caseCategoriesService.getSpecialistCategories(
      specialistId,
      { includeInactiveCategories }
    );

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const replaceSpecialistCategories = async (req, res) => {
  try {
    const { specialistId } = req.params;
    const categoryIds = req.body.category_ids.map((id) => id.trim());
    const categories = await caseCategoriesService.replaceSpecialistCategories(
      specialistId,
      categoryIds
    );

    createAuditLog({
      userId: req.user.id,
      action: "specialist_case_categories_update",
      entityName: "user",
      entityId: specialistId,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Specialist categories updated successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listMatchingSpecialists = async (req, res) => {
  try {
    const specialists = await caseCategoriesService.listMatchingSpecialists(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: specialists.length,
      data: specialists,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  getSpecialistCategories,
  replaceSpecialistCategories,
  listMatchingSpecialists,
};
