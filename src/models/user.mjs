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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
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
        throw this.#createError(
          USERNAME_EXISTS_ERR_MSG,
          ErrorCodes.USERNAME_EXISTS
        );
      }

      const result = await this.#db.run(
        "INSERT INTO users (username) VALUES (?)",
        [username]
      );
      return { id: result.lastID, username };
    } catch (error) {
      this.#handleDbError(error, ErrorCodes.USERNAME_EXISTS);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.#db.get("SELECT * FROM users WHERE id = ?", [id]);
      return user ? { id: user.id, username: user.username } : undefined;
    } catch (error) {
      this.#handleDbError(error, ErrorCodes.USER_NOT_FOUND);
    }
  }

  async getAllUsers() {
    try {
      const users = await this.#db.all("SELECT * FROM users");
      return users || [];
    } catch (error) {
      this.#handleDbError(error);
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
      this.#handleDbError(error);
    }
  }

  async getUserExerciseLog(userId, from, to, limit) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw this.#createError(
          USER_NOT_FOUND_ERR_MSG,
          ErrorCodes.USER_NOT_FOUND
        );
      }

      const query = this.#buildExerciseLogQuery(from, to, limit);
      const params = [userId, ...this.#buildQueryParams(from, to, limit)];

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
    } catch (error) {
      this.#handleDbError(error, ErrorCodes.USER_NOT_FOUND);
    }
  }

  #buildExerciseLogQuery(from, to, limit) {
    let query = "SELECT * FROM exercises WHERE userId = ?";
    if (from) query += " AND date >= ?";
    if (to) query += " AND date <= ?";
    query += " ORDER BY date DESC";
    if (limit) query += " LIMIT ?";
    return query;
  }

  #buildQueryParams(from, to, limit) {
    const params = [];
    if (from) params.push(new Date(from).getTime());
    if (to) params.push(new Date(to).getTime());
    if (limit) params.push(limit);
    return params;
  }

  #createError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  #handleDbError(error, defaultCode = ErrorCodes.GENERAL_ERROR) {
    console.error(error);
    const dbError = new Error(GENERAL_ERR_MSG);
    dbError.code = error.code || defaultCode;
    throw dbError;
  }
}
