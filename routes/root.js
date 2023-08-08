const express = require("express");

const router = express.Router();

const path = require("path");

//regex => ^/$  -> means that the requested url is only "/". "|" or index (and .html is optional here).
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
