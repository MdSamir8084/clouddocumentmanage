const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const pool = require("./db");
const { requireLogin, requireAdmin } = require("./auth");
const seedAdmin = require("./seedAdmin");

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* =========================
   AWS S3 CONFIGURATION
========================= */

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1"
});

const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  console.warn("WARNING: S3_BUCKET is not configured.");
}

/* =========================
   BASIC EXPRESS CONFIG
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

/*
   Frontend files
*/
app.use(express.static(path.join(__dirname, "..", "frontend")));

/* =========================
   MULTER CONFIGURATION
========================= */

/*
   IMPORTANT:
   Pehle multer diskStorage use kar raha tha.

   Ab memoryStorage use kar rahe hain,
   taaki uploaded file RAM me temporarily aaye
   aur directly S3 me upload ho.
*/

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize:
      Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024
  },

  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, JPG, PNG and WEBP files are allowed."
        )
      );
    }
  }
});

/* =========================
   HELPER FUNCTIONS
========================= */

/*
   Original filename ko safe banata hai.
*/
function safeFileName(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/*
   S3 se temporary secure download URL generate karta hai.
*/
async function createDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key
  });

  return getSignedUrl(s3, command, {
    expiresIn: 60 * 10
  });
}

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
      storage: "s3"
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/* =========================
   REGISTER
========================= */

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users
       (name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        email,
        hash,
        phone || null
      ]
    );

    res.status(201).json({
      message: "Registration successful. Please login."
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Registration failed."
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        role
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
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
      redirect:
        user.role === "admin"
          ? "/admin.html"
          : "/dashboard.html"
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Login failed."
    });
  }
});

/* =========================
   LOGOUT
========================= */

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      message: "Logged out."
    });
  });
});

/* =========================
   CURRENT USER
========================= */

app.get("/api/me", requireLogin, (req, res) => {
  res.json(req.session.user);
});

/* =========================
   PROFILE
========================= */

app.get("/api/profile", requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        created_at
       FROM users
       WHERE id = ?`,
      [req.session.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load profile."
    });
  }
});

app.put("/api/profile", requireLogin, async (req, res) => {
  try {
    const { name, phone } = req.body;

    await pool.query(
      `UPDATE users
       SET name = ?, phone = ?
       WHERE id = ?`,
      [
        name,
        phone || null,
        req.session.user.id
      ]
    );

    req.session.user.name = name;
    req.session.user.phone = phone || null;

    res.json({
      message: "Profile updated.",
      user: req.session.user
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Profile update failed."
    });
  }
});

/* ==================================================
   DOCUMENT UPLOAD
   MULTER → S3 → RDS
================================================== */

app.post(
  "/api/documents",
  requireLogin,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "PDF/JPG/PNG/WEBP file is required."
        });
      }

      if (!S3_BUCKET) {
        return res.status(500).json({
          message: "S3 bucket is not configured."
        });
      }

      /*
         Safe original filename
      */
      const safeName = safeFileName(
        req.file.originalname
      );

      /*
         Unique filename
      */
      const storedName =
        `${Date.now()}-${safeName}`;

      /*
         S3 object key

         Example:
         users/5/documents/1728123456-resume.pdf
      */
      const s3Key =
        `users/${req.session.user.id}/documents/${storedName}`;

      /*
         Upload file to S3
      */
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      });

      await s3.send(command);

      /*
         Save metadata in RDS
      */
      await pool.query(
        `INSERT INTO documents
          (
            user_id,
            file_name,
            stored_name,
            file_path,
            file_type,
            file_size
          )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.session.user.id,
          req.file.originalname,
          storedName,
          s3Key,
          req.file.mimetype,
          req.file.size
        ]
      );

      res.status(201).json({
        message: "Document uploaded successfully.",
        file: {
          name: req.file.originalname,
          key: s3Key,
          size: req.file.size
        }
      });
    } catch (err) {
      console.error("S3 Upload Error:", err);

      res.status(500).json({
        message: "Document upload failed."
      });
    }
  }
);

/* =========================
   STUDENT DOCUMENTS
========================= */

app.get(
  "/api/documents",
  requireLogin,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_at
         FROM documents
         WHERE user_id = ?
         ORDER BY uploaded_at DESC`,
        [req.session.user.id]
      );

      /*
         Generate temporary S3 URLs
      */
      const documents = await Promise.all(
        rows.map(async (doc) => {
          let downloadUrl = null;

          try {
            downloadUrl = await createDownloadUrl(
              doc.file_path
            );
          } catch (err) {
            console.error(
              "URL generation failed:",
              err.message
            );
          }

          return {
            ...doc,
            download_url: downloadUrl
          };
        })
      );

      res.json(documents);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load documents."
      });
    }
  }
);

/* =========================
   CONTACT
========================= */

app.post("/api/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      message
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    await pool.query(
      `INSERT INTO messages
       (name, email, message)
       VALUES (?, ?, ?)`,
      [
        name,
        email,
        message
      ]
    );

    res.status(201).json({
      message: "Message sent successfully."
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Message sending failed."
    });
  }
});

/* =========================
   ADMIN STATS
========================= */

app.get(
  "/api/admin/stats",
  requireAdmin,
  async (_, res) => {
    try {
      const [[users]] =
        await pool.query(
          `SELECT COUNT(*) AS total
           FROM users
           WHERE role = 'student'`
        );

      const [[messages]] =
        await pool.query(
          `SELECT COUNT(*) AS total
           FROM messages`
        );

      const [[documents]] =
        await pool.query(
          `SELECT COUNT(*) AS total
           FROM documents`
        );

      res.json({
        users: users.total,
        messages: messages.total,
        documents: documents.total
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load statistics."
      });
    }
  }
);

/* =========================
   ADMIN USERS
========================= */

app.get(
  "/api/admin/users",
  requireAdmin,
  async (_, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          name,
          email,
          phone,
          role,
          created_at
         FROM users
         ORDER BY created_at DESC`
      );

      res.json(rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load users."
      });
    }
  }
);

/* =========================
   ADMIN MESSAGES
========================= */

app.get(
  "/api/admin/messages",
  requireAdmin,
  async (_, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
          id,
          name,
          email,
          message,
          created_at
         FROM messages
         ORDER BY created_at DESC`
      );

      res.json(rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load messages."
      });
    }
  }
);

/* =========================
   ADMIN DOCUMENTS
========================= */

app.get(
  "/api/admin/documents",
  requireAdmin,
  async (_, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
          d.id,
          d.file_name,
          d.file_path,
          d.file_type,
          d.file_size,
          d.uploaded_at,
          u.name AS user_name,
          u.email AS user_email
         FROM documents d
         JOIN users u
           ON u.id = d.user_id
         ORDER BY d.uploaded_at DESC`
      );

      const documents = await Promise.all(
        rows.map(async (doc) => {
          let downloadUrl = null;

          try {
            downloadUrl = await createDownloadUrl(
              doc.file_path
            );
          } catch (err) {
            console.error(
              "Admin URL generation failed:",
              err.message
            );
          }

          return {
            ...doc,
            download_url: downloadUrl
          };
        })
      );

      res.json(documents);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to load documents."
      });
    }
  }
);

/* =========================
   FRONTEND FALLBACK
========================= */

app.get(/.*/, (_, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "..",
      "frontend",
      "index.html"
    )
  );
});

/* =========================
   START SERVER
========================= */

async function start() {
  try {
    await pool.query("SELECT 1");

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(
        `Server running: http://localhost:${PORT}`
      );

      console.log(
        `S3 Bucket: ${S3_BUCKET || "NOT CONFIGURED"}`
      );

      console.log(
        `AWS Region: ${process.env.AWS_REGION || "eu-north-1"}`
      );
    });
  } catch (err) {
    console.error(
      "Startup failed:",
      err.message
    );

    process.exit(1);
  }
}

start();