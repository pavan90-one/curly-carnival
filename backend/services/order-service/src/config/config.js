const dotenv = require("dotenv").config()
const config = {
    data_Url:process.env.DATABASE_URL,
    port:Number(process.env.PORT) || 4003
}
module.exports = config;