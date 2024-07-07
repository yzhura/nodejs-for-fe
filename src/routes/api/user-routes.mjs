import { Router } from "express";
import UserModel from "../../models/user.mjs";
import {
  GENERAL_ERR_MSG,
  USER_REQUIRED_ERR_MSG,
  USERS_EMPTY_LIST_ERR_MSG,
  USERNAME_EXISTS_ERR_MSG,
  INVALID_USERNAME_ERR_MSG,
} from "../../constants/error-msgs.mjs";
import { validateUsername } from "../../helpers/general.mjs";

const router = Router();

let userModel;

UserModel.init().then((model) => {
  userModel = model;
  console.log("Database initialized");
});

router.post("/users", async (req, res) => {
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
    console.error(error);
    if (error.message === USERNAME_EXISTS_ERR_MSG) {
      res.status(409).json({ error: USERNAME_EXISTS_ERR_MSG });
    } else {
      res.status(500).json({ error: GENERAL_ERR_MSG });
    }
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    if (!users || !users.length) {
      res.status(404).json({ error: USERS_EMPTY_LIST_ERR_MSG });
      return;
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("ERROR::", error.message);
    res.status(500).json({ error: GENERAL_ERR_MSG });
  }
});

export default router;
