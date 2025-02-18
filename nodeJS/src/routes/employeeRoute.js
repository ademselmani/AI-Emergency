var express = require("express");
var router = express.Router();
const Employee = require("../models/Employee")



router.post("/addEmployee", async (req, res, next) => {
    const employee = new Employee({
      cin: req.body.cin
    });
  
    await employee.save();
  
    res.json(employee);
  });

  router.get(
    '/profile',
    (req, res, next) => {
      res.json({
        message: 'You made it to the secure route',
        user: req.user,
        token: req.query.secret_token
      })
    }
  );

  module.exports = router;