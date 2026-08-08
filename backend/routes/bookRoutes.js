const express = require("express");

const router = express.Router();

const {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

// GET all books
router.get("/", getBooks);

// GET one book
router.get("/:id", getBook);

// CREATE book
router.post("/", createBook);

// UPDATE book
router.put("/:id", updateBook);

// DELETE book
router.delete("/:id", deleteBook);

module.exports = router;