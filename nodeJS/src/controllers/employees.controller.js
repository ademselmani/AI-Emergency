const { findUserbyId } = require("../services/employee.service.js");

const profileController = (req, res, next) => {
  res.json({
    message: "You made it to the secure route",
    user: req.user,
  });
};

const employeesController = async (req, res, next) => {
  const user = await findUserbyId(req.params.id);
  console.log(user)
  res.json(user);
};

// Exporte tes contrôleurs avec module.exports
module.exports = {
  profileController,
  employeesController,
};
