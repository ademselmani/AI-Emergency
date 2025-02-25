const User = require("../models/employee.model");
const { profileController , employeesController } = require("../controllers/employees.controller")
const authMiddleware = require("../middlewares/auth/auth");
const router = require("express").Router();


router.get("/profile", authMiddleware, profileController );
router.get("/finduser/:id", authMiddleware, employeesController );


// router.delete(
//   "/deleteEmployees/:id",
//   authMiddleware,
//   async (req, res, next) => {
//     const { id } = req.params;
//     await Employee.findByIdAndDelete(id);
//     res.send("employees has been deleted");
//   }
// );

// router.put('/editEmployee/:id', authMiddleware, async (req, res, next) => {
//     try {
//         const { email, phone, oldPassword, newPassword } = req.body;
//         const _id = req.params.id;

//         const employee = await Employee.findById(_id);
//         if (!employee) {
//             return res.status(404).json({ error: "User not found" });
//         }
    

//         // Update email and phone if provided
//         if (email) employee.email = email;
//         if (phone) employee.phone = phone;

//         // If user wants to change the password
//         if (oldPassword && newPassword) {
//             // Get the latest stored hashed password from DB
//             const latestEmployee = await Employee.findById(_id);
            
//             // Compare the old password with the **latest** stored hashed password
//             const isMatch = await bcrypt.compare(oldPassword, latestEmployee.password);
//             if (!isMatch) {
//                 return res.status(400).json({ error: "Old password is incorrect" });
//             }

//              // Let the "pre-save" middleware handle hashing
//             employee.password = newPassword;
//         }

//         await employee.save();
//         res.json({ message: "User updated successfully", employee });
//     } catch (error) {
//         res.status(500).json(error);
//     }
// });

module.exports = router;