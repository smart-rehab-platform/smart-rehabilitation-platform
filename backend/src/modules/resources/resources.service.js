const pool = require("../../database/db");

const createResource = async (data) => {
  const { title, description, file_url, resource_type, uploaded_by } = data;

  const result = await pool.query(
    `INSERT INTO resources 
     (title, description, file_url, resource_type, uploaded_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, file_url, resource_type, uploaded_by]
  );

  return result.rows[0];
};

const getAllResources = async () => {
  const result = await pool.query(
    `SELECT * FROM resources ORDER BY created_at DESC`
  );

  return result.rows;
};

const getResourceById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM resources WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

const getResourcesByType = async (type) => {
  const result = await pool.query(
    `SELECT * FROM resources 
     WHERE resource_type = $1 
     ORDER BY created_at DESC`,
    [type]
  );

  return result.rows;
};

const updateResource = async (id, data) => {
  const { title, description, file_url, resource_type, uploaded_by } = data;

  const result = await pool.query(
    `UPDATE resources
     SET title = $1,
         description = $2,
         file_url = $3,
         resource_type = $4,
         uploaded_by = $5
     WHERE id = $6
     RETURNING *`,
    [title, description, file_url, resource_type, uploaded_by, id]
  );

  return result.rows[0];
};

const deleteResource = async (id) => {
  const result = await pool.query(
    `DELETE FROM resources
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  getResourcesByType,
  updateResource,
  deleteResource,
};