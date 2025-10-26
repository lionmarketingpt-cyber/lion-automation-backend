const express = require("express");
const db = require("../db");
const { generateReply } = require("../services/aiResponder");

const router = express.Router();

// simular mensagem recebida do cliente
router.post("/incoming", async (req,res) => {
  const { brand_id, from_number, text } = req.body;

  // buscar config da brand
  const brandCfgQuery = await db.query(
    `SELECT * FROM brands WHERE id=$1 LIMIT 1`,
    [brand_id]
  );
  const brandCfg = brandCfgQuery.rows[0] || {};

  // guardar msg do cliente
  await db.query(
    `INSERT INTO messages(brand_id, from_user, message_text)
     VALUES($1, TRUE, $2)`,
    [brand_id, text]
  );

  // gerar resposta comercial automática
  const replyText = generateReply(text, brandCfg);

  // guardar resposta do bot
  await db.query(
    `INSERT INTO messages(brand_id, from_user, message_text)
     VALUES($1, FALSE, $2)`,
    [brand_id, replyText]
  );

  // tentar criar lead automática se viu telefone
  if (text.includes("+351") || text.match(/\d{9}/)) {
    await db.query(
      `INSERT INTO leads(brand_id,name,phone,interest)
       VALUES($1,$2,$3,$4)`,
      [brand_id, "Lead Automático", from_number || "desconhecido", text]
    );
  }

  res.json({ ok:true, reply:replyText });
});

// histórico para mostrar no painel
router.get("/history/:brandId", async (req,res) => {
  const { brandId } = req.params;
  const result = await db.query(
    `SELECT id, from_user, message_text, created_at
     FROM messages
     WHERE brand_id=$1
     ORDER BY created_at DESC
     LIMIT 50`,
     [brandId]
  );
  res.json(result.rows);
});

module.exports = router;
