const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controller/telegramservicecontroller.js");
const { sendPragatiMessage } = require("../controller/pragatitelegrammessage.js");

router.post("/send-message", sendMessage);
router.post("/send-pragati", sendPragatiMessage);

module.exports = router;
