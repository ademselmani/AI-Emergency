// employee.service.js
const User = require("../models/employee.model.js");

const findUserbyId = async (id) => {
  const user = await User.findById(id);
  return user;
};

// Exporte la fonction avec module.exports
module.exports = { findUserbyId };
