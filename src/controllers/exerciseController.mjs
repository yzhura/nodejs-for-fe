import UserModel from "../models/user.mjs";
import {
  EXERCISE_REQUIRED_FIELDS_ERR_MSG,
  EXERCISE_INVALID_DATE_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
  INVALID_DESCRIPTION_ERR_MSG,
  INVALID_DURATION_ERR_MSG,
} from "../constants/error-msgs.mjs";
import { validateDate, validateDescription } from "../helpers/general.mjs";

const userModel = new UserModel();

const ExerciseController = {
  async createExercise(req, res, next) {
    try {
      const { _id } = req.params;
      const { description, duration, date } = req.body;

      if (!description) {
        return res
          .status(400)
          .json({ error: EXERCISE_REQUIRED_FIELDS_ERR_MSG });
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
      next(error);
    }
  },

  async getUserExerciseLog(req, res, next) {
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
      next(error);
    }
  },
};

export default ExerciseController;
