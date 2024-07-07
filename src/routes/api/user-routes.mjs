import { Router } from "express";
import UserModel from "../../models/user.mjs";
import {
  GENERAL_ERR_MSG,
  USER_REQUIRED_ERR_MSG,
} from "../../constants/error-msgs.mjs";

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

    const user = await userModel.createUser(username);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: GENERAL_ERR_MSG });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(201).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: GENERAL_ERR_MSG });
  }
});

export default router;
