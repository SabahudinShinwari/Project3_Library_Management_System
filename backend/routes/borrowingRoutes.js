const express = require("express");

const router = express.Router();

const {
    getBorrowings,
    getBorrowing,
    borrowBook,
    returnBook
} = require("../controllers/borrowingController");

// GET all borrowing records
router.get("/", getBorrowings);

// GET one borrowing record
router.get("/:id", getBorrowing);

// BORROW a book
router.post("/", borrowBook);

// RETURN a book
router.put("/:id/return", returnBook);

module.exports = router;