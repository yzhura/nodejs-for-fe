import { Database } from "sqlite-async";
import { ErrorCodes } from "../constants/error-codes.mjs";
import {
  GENERAL_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
  USERNAME_EXISTS_ERR_MSG,
} from "../constants/error-msgs.mjs";
import { sanitizeDescription } from "../helpers/general.mjs";

export default class UserModel {
  #db;

  constructor(db) {
    this.#db = db;
  }

  static async init() {
    const db = await Database.open("./db/users.db");
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    return new UserModel(db);
  }

  async createUser(username) {
    try {
      const existingUser = await this.#db.get(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (existingUser) {
        const error = new Error(USERNAME_EXISTS_ERR_MSG);
        error.code = ErrorCodes.USERNAME_EXISTS;
        throw error;
      }

      const result = await this.#db.run(
        "INSERT INTO users (username) VALUES (?)",
        [username]
      );

      return { id: result.lastID, username };
    } catch (error) {
      if (error.code === ErrorCodes.USERNAME_EXISTS) {
        throw error;
      }
      const dbError = new Error(GENERAL_ERR_MSG);
      dbError.code = ErrorCodes.GENERAL_ERROR;
      throw dbError;
    }
  }

  async getUserById(id) {
    try {
      const user = await this.#db.get("SELECT * FROM users WHERE id = ?", [id]);
      return user ? { id: user.id, username: user.username } : undefined;
    } catch (error) {
      console.error(error);
      const dbError = new Error(USER_NOT_FOUND_ERR_MSG);
      dbError.code = ErrorCodes.USER_NOT_FOUND;
      throw dbError;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.#db.all("SELECT * FROM users");
      return users || [];
    } catch (error) {
      console.error(error);
      const dbError = new Error(GENERAL_ERR_MSG);
      dbError.code = ErrorCodes.GENERAL_ERROR;
      throw dbError;
    }
  }

  async createExercise(userId, description, duration, date) {
    try {
      const sanitizedDescription = sanitizeDescription(description);
      const dateValue = date ? new Date(date).getTime() : Date.now();

      const result = await this.#db.run(
        "INSERT INTO exercises (userId, description, duration, date) VALUES (?, ?, ?, ?)",
        [userId, sanitizedDescription, duration, dateValue]
      );

      return {
        userId,
        exerciseId: result.lastID,
        description: sanitizedDescription,
        duration,
        date: new Date(dateValue).toISOString().split("T")[0],
      };
    } catch (error) {
      console.error(error);
      const dbError = new Error(GENERAL_ERR_MSG);
      dbError.code = ErrorCodes.GENERAL_ERROR;
      throw dbError;
    }
  }

  async getUserExerciseLog(userId, from, to, limit) {
    const user = await this.#db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (!user) {
      const error = new Error(USER_NOT_FOUND_ERR_MSG);
      error.code = ErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    let query = "SELECT * FROM exercises WHERE userId = ?";
    const params = [userId];

    if (from) {
      query += " AND date >= ?";
      params.push(new Date(from).getTime());
    }
    if (to) {
      query += " AND date <= ?";
      params.push(new Date(to).getTime());
    }
    query += " ORDER BY date DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }

    const exercises = await this.#db.all(query, params);
    return {
      id: user.id,
      username: user.username,
      count: exercises.length,
      log: exercises.map((exercise) => ({
        id: exercise.id,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toISOString().split("T")[0],
      })),
    };
  }
}
