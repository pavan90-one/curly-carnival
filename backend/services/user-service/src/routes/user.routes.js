const express = require('express');
const Routes = express.Router();
const UserController = require('../controllers/user.controller');
const userController = new UserController();

Routes.get('/', userController.getUser.bind(userController));
Routes.post('/create', userController.createUser.bind(userController));
Routes.post('/seed', userController.seedUsers.bind(userController));
Routes.post('/seed/:count', userController.seedUsers.bind(userController));
Routes.get('/seed10', userController.seedUsers.bind(userController));
Routes.put('/update', userController.updateUser.bind(userController));
Routes.delete('/:id', userController.deleteUser.bind(userController));
Routes.get('/:id', userController.getUserById.bind(userController));
Routes.put('/:id', userController.updateUserById.bind(userController));

module.exports = Routes;
