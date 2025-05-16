
const express = require('express')

const mongoose = require('mongoose')

const dotenv = require("dotenv")

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require("./Models/userModel")

const Property = require("./Models/propertyModel")

const SavedProperty = require("./Models/savedPropertyModel")

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


// 1. setup user roles: agent and regular user
// 2. Agents can add new property listings.
// 3. Define Schemas: User, Property

 app.get("/", (req, res) =>{
    console.log("Welcome to Abuja Real Estate server")
 })

//  get all-users

app.get("/all-users", async(req, res)=>{
    try {
    const allUsers = await User.find()
    res.status(200).json({
        message: "Success",
        allUsers
    })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})




//  Registeration: Agent/User Roles
 app.post("/auth/register", async(req, res) =>{
    try {
    const {firstName, middleName, lastName, email, username, password, role} = req.body
      if (!firstName) {
         return  res.status(400).json({
            message: "Enter your firstname"
        })
      }

      if (!lastName) {
         return res.status(400).json({
            message: "Enter your lastname"
        })
      }

      if (!username) {
         return  res.status(400).json({
            message: "Enter a username"
        })
      }

      if (!email) {
         return  res.status(400).json({
            message: "Add your email address"
        })
      }

      if (!password) {
         return  res.status(400).json({
            message: "Enter your password"
        })
      }

      const existingUser = await User.findOne({email})

      if (existingUser) {
        return res.status(400).json({
            message: "Account already exist"
        })
      }

      const existingUsername = await User.findOne({username})

      if (existingUsername) {
            return res.status(400).json({
                message: "Username has been taken"
            })
      }

      if (password.length < 8){
        return res.status(400).json({
            message: "Password must be 8 characters and above."
        })
      }
        const hashedPassword = await bcrypt.hash(password, 12)

        const newUser = new User({
             firstName,
             middleName, 
             lastName, 
             email, 
             username, 
             password: hashedPassword, 
             role
        });
        await newUser.save();
        
        res.status(201).json({
            message: "User account created successfully",
            newUser:{
                firstName, middleName, lastName, email, username, role
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
    
 })



//  User/Agent Login
app.post("/auth/login", async(req, res) =>{
  try {
    
    const {email, username, password} = req.body
    const user = await User.findOne({
        $or: [{username}, {email}

        ]
    })

    if (!user) {
        return res.status(404).json({
            message: "user account does not exist."
        })
    }

    const isMatch = await bcrypt.compare(password, user?.password)

    if (!isMatch) {
        return res.status(400).json("Incorrect login details.")
    }
    
    // Generate a token
    const accessToken = jwt.sign(
        {id: user?._id},
        process.env.ACCESS_TOKEN,
        {expiresIn: "5m"}
    )

    const refreshToken = jwt.sign(
        {id: user?._id},
        process.env.REFRESH_TOKEN,
        {expiresIn: "30d"}
    )
     res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
            firstName: user?.email,
            lastName: user?.lastName,
            email: user?.email,
            username: user?.username,
            role: user?.role
        },

        refreshToken
     })
     
     } catch (error) {
       res.status(500).json({
        message: error.message
       })
 }
})
 

// Property listings by agents
 app.post("/properties-agent", async(req, res) =>{
    const {title, description, image, price, location, Agent} = req.body

    try {
        const user = await User.findById(Agent);
        if (!user || user.role !== "agent") {
            return res.status(403).json({
                message: "Only agents can add properties"
            });
        }


    //       const existingProperty = await Property.findOne({image})

    //   if (existingProperty) {
    //     return res.status(400).json({
    //         message: "Property already exist"
    //     })
    //   }
const newProperty = new Property({
    title,
    description,
    image,
    price,
    location,
    Agent
})

await newProperty.save();

res.status(201).json({
    message: "Property added successfully",
    newProperty: {
        title,
        description,
        image,
        price,
        location,
        Agent
    }
})

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
 })

 // Get all available Properties
app.get("/available-properties", async(req, res) =>{
    try {
        const availableProperties = await Property.find()
        res.status(200).json({
            message: "Success",
            availableProperties
        }) 
    } catch (error) {
        
    }
})