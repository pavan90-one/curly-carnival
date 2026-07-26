const mongoose = require('mongoose');
const authSchema = require('../schema/auth.schema');

const authModel = mongoose.model('Auth', authSchema);
module.exports = authModel;

