const express = require("express");
const db = require("../db");
const router = express.Router();

// buscar config da marca pelo user_id
router.get("/:userId", async (req,res) => {
  const { userId } = req.params;
  const result = await db.query(
    `SELECT id, company_name, tone_of_voice, services, pricing_policy,
            address, schedule, extra_notes
     FROM brands
     WHERE user_id=$1
     LIMIT 1`,
    [userId]
  );
  res.json(result.rows[0] || null);
});

// criar/atualizar config da marca
router.post("/", async (req,res) => {
  const {
    user_id,
    company_name,
    tone_of_voice,
    services,
    pricing_policy,
    address,
    schedule,
    extra_notes
  } = req.body;

  // já existe brand para este user?
  const check = await db.query(
    "SELECT id FROM brands WHERE user_id=$1 LIMIT 1",
    [user_id]
  );

  if (check.rows.length === 0) {
    // criar nova
    const result = await db.query(
      `INSERT INTO brands(
        user_id, company_name, tone_of_voice, services, pricing_policy,
        address, schedule, extra_notes, updated_at
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      RETURNING *`,
      [
        user_id,
        company_name,
        tone_of_voice,
        services,
        pricing_policy,
        address,
        schedule,
        extra_notes
      ]
    );
    return res.json(result.rows[0]);
  } else {
    // atualizar existente
    const brandId = check.rows[0].id;
    const result = await db.query(
      `UPDATE brands
       SET company_name=$1,
           tone_of_voice=$2,
           services=$3,
           pricing_policy=$4,
           address=$5,
           schedule=$6,
           extra_notes=$7,
           updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
       [
         company_name,
         tone_of_voice,
         services,
         pricing_policy,
         address,
         schedule,
         extra_notes,
         brandId
       ]
    );
    return res.json(result.rows[0]);
  }
});

module.exports = router;
