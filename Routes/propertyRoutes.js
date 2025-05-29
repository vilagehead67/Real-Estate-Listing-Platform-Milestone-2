
const express = require("express")
const { authorization } = require("../Middleware/auth")
const { agentAuthorization } = require("../Middleware/agentOnly")
const { handleAvailableProperties, handlePropertyListingsByAgent, handleGetSpecificProperty, handleDeletePropertyByAgent, handleUpdatePropertyByAgent } = require("../Controllers/propertyController")

const router = express.Router()

router.post("/properties-agent", authorization, agentAuthorization, handlePropertyListingsByAgent)

router.patch("/update/property/:id", authorization, agentAuthorization, handleUpdatePropertyByAgent)

router.delete("/agent/deleteproperty/:id", authorization, agentAuthorization, handleDeletePropertyByAgent)

router.get("/all-properties", authorization, handleAvailableProperties)

router.get("/properties/:id", authorization, handleGetSpecificProperty)







module.exports = router