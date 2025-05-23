const express = require("express")
const mongoose = require("mongoose")
const  dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../Models/userModel")
const Property = require("../Models/propertyModel")
const SavedProperty = require("../Models/savedPropertyModel")
const sendMail = require("../sendMail")
const { findUserService } = require("../Service/indexService")
const {validEmail} = require("../sendMail")


// MILESTONE ONE
   const  handleGetAllUsers = async(req, res)=>{
    try {
        const allUsers = await findUserService()
    res.status(200).json({
        message: "Success",
        allUsers
    })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


    const handleUserRegistration = async(req, res) =>{
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
      
     if (!validEmail(email)) {
            return res.status(400).json({
                message: "Incorrect email format"
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
    
 }


    const handleUserLogin = async(req, res) =>{
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
            {expiresIn: "5h"}
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
                firstName: user?.firstName,
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
    }

    const handleForgottenPassword = async(req,res)=>{
      const {email} = req.body
      try {
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({
                message: "User account not found."
            })
        }
        const accessToken = await jwt.sign(
        {user}, 
        `${process.env.ACCESS_TOKEN}}`, 
        {expiresIn: "5m"})
        await sendMail.sendForgottenPasswordEmail(email, accessToken)

        // send OTP
        res.status(200).json({message: "Please check your email inbox"});
      } catch (error) {
        res.status(500).json({
            error: "Unable to load page"
        })
      }
    }


    const handleResetPassword = async(req, res)=>{
         const {password} = req.body
         try {
            const user = await User.findOne({email: req.user.email})
            if (!user) {
                return res.status(404).json({
                    message: "User account does not exist."
                })
                 }
                const hashedPassword = await bcrypt.hash(password, 12)
                user.password = hashedPassword 
                await user.save()
                res.status(200).json({
                    message: "Password resset successful."
                })
           
         } catch (error) {
            res.status(500).json({
                error: "Unable to reset password"
            })
         }
    }

    const handlePropertyListingsByAgent = async(req, res) =>{
    const {title, description, image, price, location, listedBy} = req.body

    try {
        const user = await User.findById(listedBy);

     const newProperty = new Property({
    title,
    description,
    image,
    price,
    location,
    listedBy
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
        listedBy
    }
})

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
 }



//  MILESTONE 2: BROWSING AND SAVING PROPERTIES

 const handleAvailableProperties = async(req, res) =>{
    try {
        const availableProperties = await Property.find().populate("listedBy", "email username");
        res.status(200).json({
            message: "Success",
            availableProperties
        }) 
    } catch (error) {
        res.status(500).json({error: "Failed to fetch properties"});
    }
}


   const handleGetSpecificProperty = async(req, res) =>{
       const {id} = req.params
       try {
           const property = await Property.findById(id).populate("listedBy", "username email")
   
           if (!property){
               return res.status(404).json({
                   message: "Property not found."
               })
           }
           res.status(200).json({
               message: "Success",
               property
           })
       } catch (error) {
          res.status(500).json({error: "Failed to fetch property"}) 
       }
   }
   
    const handleSaveProperty = async(req, res) =>{
    const { propertyId} = req.body
    try {
        // check if property is already saved
        const alreadySaved = await SavedProperty.findOne({ user: req.user.id, property: propertyId})
        if (alreadySaved) {
            return res.status(400).json({
                message: "Property already saved"
            })
        }

        const newSave = new SavedProperty({user: req.user.id, property: propertyId})
         await newSave.save()

         res.status(201).json({
            message: "Property saved.",
            newSave
         })
    } catch (error) {
        res.status(500).json({
            error: "Failed to save property."
        })
    }
}

     const handleUnsaveProperty = async(req, res) =>{
          const {propertyId} = req.params
         try {
     
            const deleted = await SavedProperty.findOneAndDelete({user: req.user.id, property: propertyId})

            if (!deleted) {
                return res.status(404).json({
                    message: "Saved property not found."
                })
            }
            res.status(200).json({
             message: "Property unsaved."
            })
         } catch (error) {
             res.status(500).json({
                 error: "Failed to unsave property"
             })
         }
     }
        
    const handleGetAllSavedProperties = async(req, res) =>{
    try {
        
        const saved = await SavedProperty.find({user: req.user.id}).populate("property")
        
        res.status(200).json({
            message: "Saved Properties",
            saved
        })
    } catch (error) {
          res.status(500).json({
            error: "Failed to fetch saved properties."
          })
    }
}


 module.exports = {
    handlePropertyListingsByAgent,
    handleGetAllUsers,
    handleUserRegistration,
    handleUserLogin,
    handleAvailableProperties,
    handleGetSpecificProperty,
    handleSaveProperty,
    handleUnsaveProperty,
    handleGetAllSavedProperties,
    handleForgottenPassword,
    handleResetPassword
 }