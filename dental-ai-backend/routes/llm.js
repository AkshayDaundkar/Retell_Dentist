const express = require("express");
const router = express.Router();
const { generateDentalResponse } = require("../services/openaiService");

router.post("/", async (req, res) => {
  const { conversation_history } = req.body;
  const response = await generateDentalResponse(conversation_history);
  res.json({ text: response });
});

module.exports = router;
