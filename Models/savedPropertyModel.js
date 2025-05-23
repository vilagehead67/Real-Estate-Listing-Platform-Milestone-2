

const mongoose = require("mongoose")

const savedPropertySchema = new mongoose.Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",    
    require: true
},
    property: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Property",
        require: true
    }
}, {timestamps: true})

const SavedProperty = new mongoose.model("SavedProperty", savedPropertySchema)

module.exports = SavedProperty