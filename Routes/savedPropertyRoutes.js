
const express = require("express")
const { authorization } = require("../Middleware/auth")
const { handleUnsaveProperty, handleSaveProperty, handleGetAllSavedProperties, handleGetAllUsers } = require("../Controllers/savedPropertyController")


const router = express.Router()

router.get("/all-users", authorization, handleGetAllUsers)

router.post("/save-property", authorization, handleSaveProperty)

router.delete("/unsave/:propertyId", authorization, handleUnsaveProperty)

router.get("/all-saved", authorization, handleGetAllSavedProperties)


module.exports = router