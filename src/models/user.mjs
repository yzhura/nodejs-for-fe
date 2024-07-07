import { Database } from "sqlite-async";

export default class UserModel {
  db;

  constructor(db) {
    this.db = db;
  }

  static async init() {
    const db = await Database.open("./db/users.db");
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL
      )
    `);
    return new UserModel(db);
  }

  async createUser(username) {
    const result = await this.db.run(
      "INSERT INTO users (username) VALUES (?)",
      [username]
    );
    return { id: result.lastID, username };
  }

  async getUserById(id) {
    const user = await this.db.get("SELECT * FROM users WHERE id = ?", [id]);
    return user ? { id: user.id, username: user.username } : undefined;
  }

  async getAllUsers() {
    const users = await this.db.all("SELECT * FROM users");
    return users || [];
  }
}
