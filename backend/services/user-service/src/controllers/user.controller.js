const UserRepository = require("../repositories/user.repositories");
class UserController {  
  constructor() {
    
  }
  async createUser(req, res,next) {
    try {
      const userData = req.body;
      const createdUser = await UserRepository.createUser(userData);
      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  };

  async getUser(req, res,next){
    try {
      const users = await UserRepository.getUser();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  async getUserById(req, res,next) {
    try {
      const userId = req.params.id;
      const user = await UserRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  async updateUser(req, res,next) {
    try {
      const userId = req.params.id;
      const updatedUser = await UserRepository.updateUser(userId, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async updateUserById(req, res, next) {
    try {
      const userId = req.params.id;
      const updatedUser = await UserRepository.updateUser(userId, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async seedUsers(req, res, next) {
    try {
      const rawCount = req.params.count || req.query.count;
      const count = Math.min(Math.max(parseInt(rawCount, 10) || 10, 1), 100);
      const users = Array.from({ length: count }, (_, index) => {
        const id = index + 1;
        const year = 1980 + (index % 30);
        const month = ((index % 12) + 1).toString().padStart(2, '0');
        const day = ((index % 28) + 1).toString().padStart(2, '0');
        return {
          userName: `User ${id}`,
          userEmail: `user${id}@example.com`,
          userPass: `Password${id}!`,
          userAge: 20 + (index % 30),
          userDob: new Date(`${year}-${month}-${day}`)
        };
      });

      const createdUsers = await UserRepository.createUsers(users);
      res.status(201).json(createdUsers);
    } catch (error) {
      next(error);
    }
  }
 async deleteUser(req, res,next) {
    try {
      const userId = req.params.id;
      await UserRepository.deleteUser(userId);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }      
}
module.exports = UserController;