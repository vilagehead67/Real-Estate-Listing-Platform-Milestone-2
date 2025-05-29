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
       const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
      if (!passwordRegex.test(password)){
        return res.status(400).json({
            message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
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
        
        const {usernameOrEmail, password} = req.body
        const user = await User.findOne({
            $or: [{username: usernameOrEmail}, {email: usernameOrEmail}
    
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
         const {password, confirmPassword} = req.body
         try {
            const user = await User.findOne({email: req.user.email})
            if (password !== confirmPassword) {
                 return res.status(400).json({
                    message: "Password must match confirm password"
                 })
            }
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



 module.exports = {
    handleUserRegistration,
    handleUserLogin,
    handleForgottenPassword,
    handleResetPassword
 }