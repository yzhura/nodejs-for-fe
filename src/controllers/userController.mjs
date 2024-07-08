import UserModel from "../models/user.mjs";
import {
  USER_REQUIRED_ERR_MSG,
  USERS_EMPTY_LIST_ERR_MSG,
  INVALID_USERNAME_ERR_MSG,
} from "../constants/error-msgs.mjs";
import { validateUsername } from "../helpers/general.mjs";

const userModel = new UserModel();

const UserController = {
  async createUser(req, res, next) {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: USER_REQUIRED_ERR_MSG });
      }

      if (!validateUsername(username)) {
        return res.status(400).json({ error: INVALID_USERNAME_ERR_MSG });
      }

      const user = await userModel.createUser(username);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await userModel.getAllUsers();
      if (!users || !users.length) {
        return res.status(404).json({ error: USERS_EMPTY_LIST_ERR_MSG });
      }
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
};

export default UserController;
