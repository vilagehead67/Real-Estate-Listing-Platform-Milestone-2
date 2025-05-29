const express = require("express")

const User = require("../Models/userModel")

const Property = require("../Models/propertyModel")
const { get } = require("mongoose")


const handlePropertyListingsByAgent = async(req, res) =>{
    const {title, description, image, price, location, category, listedBy} = req.body

    try {
      
     const user = await User.findById(listedBy);
    
     if (!["rent", "sale"].includes(category)) {
            return res.status(400).json({
                message: "Category must be either rent or for sale."
            });
        }

     const newProperty = new Property({
    title,
    description,
    image,
    price,
    location,
    category,
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
        category,
        listedBy
    }
})

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
 }

const handleUpdatePropertyByAgent = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const agentId = req.user._id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.listedBy.equals(agentId)) {
      return res.status(403).json({ message: "You can only update your own property" });
    }

    // If new image is uploaded, update it
    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image; 
      // prevent replacing image with undefined
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
        message: "Property updated successfully",
        updatedProperty
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
  
const handleDeletePropertyByAgent = async(req, res) =>{
    const propertyId = req.params.id;
    const agentId = req.user._id

    const property = await Property.findById(propertyId);

    if (!property) {
        return res.status(404).json({
            message: "Property not found"
        })
    }
    if (!property.listedBy.equals(agentId)) {
        return res.status(403).json({
            message: "You can only delete your own property"
        })
    }
    await Property.findByIdAndDelete(propertyId);
    res.status(200).json({
        message: "Property deleted successfully."
    })
 }

 //  MILESTONE 2: BROWSING AND SAVING PROPERTIES

const handleAvailableProperties = async(req, res) =>{
    try {
        const {location, category, minPrice, maxPrice} = req.query;


        // Add property filters
        let filters = {};
        if(location) filters.location = {$regex: new RegExp(location, "i")};
        if(category) filters.category = {$regex: new RegExp(category, "i")};
        if(minPrice || maxPrice) {
            filters.price = {};
            if(minPrice) filters.price.$gte = parseFloat(minPrice);
            if(maxPrice) filters.price.$lte = parseFloat(maxPrice) 
        }
        const availableProperties = await Property.find(filters).populate("listedBy", "email username");
        res.status(200).json({
            message: "Success",
            availableProperties
        }); 
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
   


 module.exports = {

    handlePropertyListingsByAgent,
    handleAvailableProperties,
    handleGetSpecificProperty,
    handleUpdatePropertyByAgent, 
    handleDeletePropertyByAgent
 }