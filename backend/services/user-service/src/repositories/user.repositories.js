const User = require("../models/user.model");

const createUser = async (userData) => {
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error(`Error creating user: ${error.message}`);
    }
};

const createUsers = async (users) => {
    try {
        return await User.insertMany(users);
    } catch (error) {
        throw new Error(`Error creating users: ${error.message}`);
    }
};

const getUser = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error(`Error fetching users: ${error.message}`);
    }
};

const getUserById = async (userId) => {
    try {
        return await User.findById(userId);
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

const updateUser = async (userId, updateData) => {
    try {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    } catch (error) {
        throw new Error(`Error updating user: ${error.message}`);
    }
};

const deleteUser = async (userId) => {
    try {
        return await User.findByIdAndDelete(userId);
    } catch (error) {
        throw new Error(`Error deleting user: ${error.message}`);
    }
};

module.exports = {
    createUser,
    createUsers,
    getUser,
    getUserById,
    updateUser,
    deleteUser
};