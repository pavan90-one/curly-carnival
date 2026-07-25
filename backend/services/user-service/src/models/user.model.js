const mongoose = require('mongoose');
const User = require('../schema/user.schema');
module.exports = mongoose.model('User', User);