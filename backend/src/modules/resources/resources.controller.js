const resourcesService = require("./resources.service");

const createResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.createResource(req.body);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const getAllResources = async (req, res, next) => {
  try {
    const resources = await resourcesService.getAllResources();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const resource = await resourcesService.getResourceById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const getResourcesByType = async (req, res, next) => {
  try {
    const resources = await resourcesService.getResourcesByType(req.params.type);

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.updateResource(req.params.id, req.body);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.deleteResource(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  getResourcesByType,
  updateResource,
  deleteResource,
};