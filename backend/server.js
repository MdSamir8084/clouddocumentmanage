const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pool = require("./db");
const { requireLogin, requireAdmin } = require("./auth");
const seedAdmin = require("./seedAdmin");

const app = express();
const PORT = Number(process.env.PORT || 3000);

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 4
  }
}));

app.use("/uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "..", "frontend")));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});

app.get("/api/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
      [name, email, hash, phone || null]
    );

    res.status(201).json({ message: "Registration successful. Please login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, phone, role FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    res.json({
      message: "Login successful.",
      user: req.session.user,
      redirect: user.role === "admin" ? "/admin.html" : "/dashboard.html"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

app.get("/api/me", requireLogin, (req, res) => {
  res.json(req.session.user);
});

app.get("/api/profile", requireLogin, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
    [req.session.user.id]
  );
  res.json(rows[0]);
});

app.put("/api/profile", requireLogin, async (req, res) => {
  const { name, phone } = req.body;

  await pool.query(
    "UPDATE users SET name = ?, phone = ? WHERE id = ?",
    [name, phone || null, req.session.user.id]
  );

  req.session.user.name = name;
  req.session.user.phone = phone || null;

  res.json({ message: "Profile updated.", user: req.session.user });
});

app.post("/api/documents", requireLogin, upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF/JPG/PNG file is required." });
  }

  await pool.query(
    `INSERT INTO documents
      (user_id, file_name, stored_name, file_path, file_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.session.user.id,
      req.file.originalname,
      req.file.filename,
      `/uploads/${req.file.filename}`,
      req.file.mimetype,
      req.file.size
    ]
  );

  res.status(201).json({ message: "Document uploaded successfully." });
});

app.get("/api/documents", requireLogin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, file_name, file_path, file_type, file_size, uploaded_at
     FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC`,
    [req.session.user.id]
  );
  res.json(rows);
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  await pool.query(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message]
  );

  res.status(201).json({ message: "Message sent successfully." });
});

// Admin APIs
app.get("/api/admin/stats", requireAdmin, async (_, res) => {
  const [[users]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
  const [[messages]] = await pool.query("SELECT COUNT(*) AS total FROM messages");
  const [[documents]] = await pool.query("SELECT COUNT(*) AS total FROM documents");

  res.json({
    users: users.total,
    messages: messages.total,
    documents: documents.total
  });
});

app.get("/api/admin/users", requireAdmin, async (_, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json(rows);
});

app.get("/api/admin/messages", requireAdmin, async (_, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, message, created_at FROM messages ORDER BY created_at DESC"
  );
  res.json(rows);
});

app.get("/api/admin/documents", requireAdmin, async (_, res) => {
  const [rows] = await pool.query(
    `SELECT d.id, d.file_name, d.file_path, d.file_type, d.file_size,
            d.uploaded_at, u.name AS user_name, u.email AS user_email
     FROM documents d
     JOIN users u ON u.id = d.user_id
     ORDER BY d.uploaded_at DESC`
  );
  res.json(rows);
});

app.get(/.*/, (_, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

async function start() {
  try {
    await pool.query("SELECT 1");
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

start();
