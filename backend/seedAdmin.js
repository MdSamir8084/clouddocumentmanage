const bcrypt = require("bcryptjs");
const pool = require("./db");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

  if (rows.length === 0) {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      [name, email, hash]
    );
    console.log(`Admin created: ${email}`);
  }
}

module.exports = seedAdmin;
