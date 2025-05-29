
const express = require('express')

const mongoose = require('mongoose')

const dotenv = require("dotenv")

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require("./Models/userModel")

const Property = require("./Models/propertyModel")

const SavedProperty = require("./Models/savedPropertyModel")
const sendMail = require("./sendMail")


dotenv.config()

const routes = require("./Routes")


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
    res.status(200).json("Welcome to Abuja Real Estate server")
 })

//  get all-users

app.use("/api", routes)










































//  Registeration: Agent/User Roles


//  User/Agent Login


// Forgotten password


// Reset password
 

// Property listings by agents
 





// MILESTONE 2: BROWSING AND SAVING PROPERTIES

 // Get all available Properties


// Get Specific property by ID


// Save a property


// Unsave a property
// app


// Get all saved properties for a user
// app



// MileStone 3




