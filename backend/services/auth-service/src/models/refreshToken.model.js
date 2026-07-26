const mongoose = require('mongoose');
const refreshTokenSchema = require('../schema/refreshToken.schema');

const refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;
