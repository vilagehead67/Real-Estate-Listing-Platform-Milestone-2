const express = require("express")

const SavedProperty = require("../Models/savedPropertyModel")
const { findUserService } = require("../Service/indexService")



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
    
    //  Get all saved listings for a user
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
    handleSaveProperty,
    handleUnsaveProperty,
    handleGetAllSavedProperties,
    handleGetAllUsers
}