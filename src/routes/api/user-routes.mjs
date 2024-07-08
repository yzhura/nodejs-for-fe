import { Router } from "express";
import UserModel from "../../models/user.mjs";
import { ErrorCodes } from "../../constants/error-codes.mjs";
import {
  GENERAL_ERR_MSG,
  USER_REQUIRED_ERR_MSG,
  USERS_EMPTY_LIST_ERR_MSG,
  USERNAME_EXISTS_ERR_MSG,
  INVALID_USERNAME_ERR_MSG,
  EXERCISE_REQUIRED_FIELDS_ERR_MSG,
  EXERCISE_INVALID_DATE_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
  INVALID_DESCRIPTION_ERR_MSG,
  INVALID_DURATION_ERR_MSG,
} from "../../constants/error-msgs.mjs";
import {
  validateDate,
  validateDescription,
  validateUsername,
} from "../../helpers/general.mjs";

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
    if (error.code === ErrorCodes.USERNAME_EXISTS) {
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
    }
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: GENERAL_ERR_MSG });
  }
});

router.post("/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    if (!description) {
      return res.status(400).json({ error: EXERCISE_REQUIRED_FIELDS_ERR_MSG });
    }

    if (!validateDescription(description)) {
      return res.status(400).json({ error: INVALID_DESCRIPTION_ERR_MSG });
    }

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: INVALID_DURATION_ERR_MSG });
    }

    if (date && !validateDate(date)) {
      return res.status(400).json({ error: EXERCISE_INVALID_DATE_ERR_MSG });
    }

    const user = await userModel.getUserById(_id);
    if (!user) {
      return res.status(404).json({ error: USER_NOT_FOUND_ERR_MSG });
    }

    const exerciseDate = date || new Date().toISOString().slice(0, 10);
    const createdExercise = await userModel.createExercise(
      parseInt(_id),
      description,
      parseInt(duration),
      exerciseDate
    );

    res.status(201).json(createdExercise);
  } catch (error) {
    console.error(error);
    if (error.code === ErrorCodes.GENERAL_ERROR) {
      res.status(500).json({ error: GENERAL_ERR_MSG });
    } else if (error.code === ErrorCodes.USER_NOT_FOUND) {
      res.status(404).json({ error: USER_NOT_FOUND_ERR_MSG });
    } else if (error.code === ErrorCodes.INVALID_DATE) {
      res.status(400).json({ error: EXERCISE_INVALID_DATE_ERR_MSG });
    } else {
      res.status(400).json({ error: EXERCISE_REQUIRED_FIELDS_ERR_MSG });
    }
  }
});

router.get("/users/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const userExerciseLog = await userModel.getUserExerciseLog(
      parseInt(_id),
      from,
      to,
      limit ? parseInt(limit) : undefined
    );

    res.status(200).json(userExerciseLog);
  } catch (error) {
    console.error(error);
    if (error.code === ErrorCodes.USER_NOT_FOUND) {
      res.status(404).json({ error: USER_NOT_FOUND_ERR_MSG });
    } else {
      res.status(500).json({ error: GENERAL_ERR_MSG });
    }
  }
});

export default router;
