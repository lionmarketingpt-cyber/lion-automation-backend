const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// criar primeiro utilizador
router.post("/register", async (req,res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users(email, password_hash)
     VALUES ($1,$2)
     RETURNING id,email`,
    [email, hash]
  );

  res.json(result.rows[0]);
});

// login
router.post("/login", async (req,res) => {
  const { email, password } = req.body;

  const checkUser = await db.query(
    "SELECT id,email,password_hash FROM users WHERE email=$1 LIMIT 1",
    [email]
  );

  if (checkUser.rows.length === 0) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const user = checkUser.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user_id: user.id });
});

module.exports = router;
