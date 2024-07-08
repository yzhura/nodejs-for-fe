import { Router } from "express";
import UserController from "../../controllers/userController.mjs";
import ExerciseController from "../../controllers/exerciseController.mjs";
import {
  GENERAL_ERR_MSG,
  USERNAME_EXISTS_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
  EXERCISE_INVALID_DATE_ERR_MSG,
} from "../../constants/error-msgs.mjs";
import { ErrorCodes } from "../../constants/error-codes.mjs";
import UserModel from "../../models/user.mjs";

const router = Router();
const userModel = new UserModel();

userModel.init().catch((error) => {
  console.error("Error initializing UserModel:", error);
});

router.post("/users", UserController.createUser);
router.get("/users", UserController.getAllUsers);
router.post("/users/:_id/exercises", ExerciseController.createExercise);
router.get("/users/:_id/logs", ExerciseController.getUserExerciseLog);

router.use((error, req, res, next) => {
  console.error(error);
  if (error.code === ErrorCodes.USERNAME_EXISTS) {
    res.status(409).json({ error: USERNAME_EXISTS_ERR_MSG });
  } else if (error.code === ErrorCodes.USER_NOT_FOUND) {
    res.status(404).json({ error: USER_NOT_FOUND_ERR_MSG });
  } else if (error.code === ErrorCodes.INVALID_DATE) {
    res.status(400).json({ error: EXERCISE_INVALID_DATE_ERR_MSG });
  } else {
    res.status(500).json({ error: GENERAL_ERR_MSG });
  }
});

export default router;
