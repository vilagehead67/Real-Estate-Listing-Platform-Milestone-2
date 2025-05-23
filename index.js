
const express = require('express')

const mongoose = require('mongoose')

const dotenv = require("dotenv")

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require("./Models/userModel")

const Property = require("./Models/propertyModel")

const SavedProperty = require("./Models/savedPropertyModel")
const sendMail = require("./sendMail")
const { handlePropertyListingsByAgent, handleGetAllUsers, handleUserRegistration, handleUserLogin, handleAvailableProperties, handleGetSpecificProperty, handleSaveProperty, handleUnsaveProperty, handleForgottenPassword, handleResetPassword, handleGetAllSavedProperties } = require('./Controllers/indexController')
const { authorization, validateRegister } = require('./Middleware/auth')
const { agentAuthorization } = require('./Middleware/agentOnly')

dotenv.config()


const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8000

// Database connection
mongoose.connect(process.env.MONGODB_URL).then(() =>{
    console.log("MOngoDB connected.....")

// Start server 
app.listen(PORT, () =>{
    console.log(`Server started running on port ${PORT}`)
    })
})

//  MILESTONE 1
// 1. setup user roles: agent and regular user
// 2. Agents can add new property listings.
// 3. Define Schemas: User, Property

 app.get("/", (req, res) =>{
    console.log("Welcome to Abuja Real Estate server")
 })

//  get all-users

app.get("/all-users", authorization, handleGetAllUsers)

//  Registeration: Agent/User Roles
 app.post("/auth/register", validateRegister, handleUserRegistration)

//  User/Agent Login
app.post("/auth/login", handleUserLogin)

// Forgotten password
app.post("/forgotten-password", handleForgottenPassword)

// Reset password
 app.patch("/reset-password", authorization, handleResetPassword)

// Property listings by agents
 app.post("/properties-agent", authorization, agentAuthorization, handlePropertyListingsByAgent)





// MILESTONE 2: BROWSING AND SAVING PROPERTIES

 // Get all available Properties
app.get("/all-properties", handleAvailableProperties)

// Get Specific property by ID
app.get("/properties/:id", handleGetSpecificProperty)

// Save a property
app.post("/save-property", authorization, handleSaveProperty)

// Unsave a property
app.delete("/unsave/:propertyId", authorization, handleUnsaveProperty)


// Get all saved properties for a user
app.get("/all-saved", authorization, handleGetAllSavedProperties)


