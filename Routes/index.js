
const authRoute = require("./authRoute")

const propertyRoute = require("./propertyRoutes")

const savedPropertyRoute = require("./savedPropertyRoutes")

const routes = [
     authRoute,
     propertyRoute,
     savedPropertyRoute
]

module.exports = routes