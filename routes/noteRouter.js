const express = require("express");

const noteController = require("../controllers/noteController");

const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(noteController.getAllNotes)
  .post(noteController.createNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
