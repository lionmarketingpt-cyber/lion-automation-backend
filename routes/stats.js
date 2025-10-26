const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/:brandId", async (req,res) => {
  const { brandId } = req.params;

  const leadsResult = await db.query(
    `SELECT COUNT(*) AS total_leads
     FROM leads
     WHERE brand_id=$1`,
    [brandId]
  );

  const msgsResult = await db.query(
    `SELECT COUNT(*) AS total_msgs
     FROM messages
     WHERE brand_id=$1`,
    [brandId]
  );

  res.json({
    total_leads: leadsResult.rows[0]?.total_leads || 0,
    total_msgs: msgsResult.rows[0]?.total_msgs || 0
  });
});

module.exports = router;
