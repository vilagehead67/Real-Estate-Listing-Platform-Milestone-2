
const express = require("express");
const { validateRegister, authorization } = require("../Middleware/auth");
const { handleUserRegistration, handleUserLogin, handleForgottenPassword, handleResetPassword } = require("../Controllers/authController");

const router = express.Router();


router.post("/auth/register", validateRegister, handleUserRegistration)

router.post("/auth/login", handleUserLogin)

router.post("/forgotten-password", handleForgottenPassword)

router.patch("/reset-password", authorization, handleResetPassword)


module.exports = router

