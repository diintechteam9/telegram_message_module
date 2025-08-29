const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controller/telegramservicecontroller.js");

router.post("/send-message", sendMessage);

module.exports = router;
