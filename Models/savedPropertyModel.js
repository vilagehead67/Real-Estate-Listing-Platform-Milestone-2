

const mongoose = require("mongoose")

const savedPropertySchema = new mongoose.Schema({
    user: {type: String, require: true},
    property: {type: String, require: true}
}, {timestamps: true})

const SavedProperty = new mongoose.model("SavedProperty", savedPropertySchema)

module.exports = SavedProperty