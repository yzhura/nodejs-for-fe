import { Database } from "sqlite-async";
import {
  GENERAL_ERR_MSG,
  USERNAME_EXISTS_ERR_MSG,
} from "../constants/error-msgs.mjs";

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
    return new UserModel(db);
  }

  async createUser(username) {
    try {
      const existingUser = await this.#db.get(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (existingUser) {
        throw new Error(USERNAME_EXISTS_ERR_MSG);
      }

      const result = await this.#db.run(
        "INSERT INTO users (username) VALUES (?)",
        [username]
      );

      return { id: result.lastID, username };
    } catch (error) {
      if (error.message === USERNAME_EXISTS_ERR_MSG) {
        throw new Error(USERNAME_EXISTS_ERR_MSG);
      }
      throw new Error(GENERAL_ERR_MSG);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.#db.get("SELECT * FROM users WHERE id = ?", [id]);
      return user ? { id: user.id, username: user.username } : undefined;
    } catch (error) {
      console.error(error);
      throw new Error(GENERAL_ERR_MSG);
    }
  }

  async getAllUsers() {
    try {
      const users = await this.#db.all("SELECT * FROM users");
      return users || [];
    } catch (error) {
      console.error(error);
      throw new Error(GENERAL_ERR_MSG);
    }
  }
}
