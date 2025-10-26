const express = require("express");
const db = require("../db");
const router = express.Router();

// listar leads de uma brand
router.get("/:brandId", async (req,res) => {
  const { brandId } = req.params;
  const result = await db.query(
    `SELECT id,name,phone,interest,created_at
     FROM leads
     WHERE brand_id=$1
     ORDER BY created_at DESC
     LIMIT 200`,
    [brandId]
  );
  res.json(result.rows);
});

// criar lead
router.post("/", async (req,res) => {
  const { brand_id, name, phone, interest } = req.body;

  const result = await db.query(
    `INSERT INTO leads(brand_id,name,phone,interest)
     VALUES($1,$2,$3,$4)
     RETURNING id,name,phone,interest,created_at`,
    [brand_id, name, phone, interest]
  );

  res.json(result.rows[0]);
});

module.exports = router;
