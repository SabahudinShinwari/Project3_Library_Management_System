const borrowingModel = require("../models/borrowingModel");

const getBorrowings = async (req, res) => {
    try {
        const borrowings = await borrowingModel.getAllBorrowings();
        res.json(borrowings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBorrowing = async (req, res) => {
    try {
        const borrowing = await borrowingModel.getBorrowingById(
            req.params.id
        );

        if (!borrowing) {
            return res.status(404).json({
                error: "Borrowing record not found"
            });
        }

        res.json(borrowing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const borrowBook = async (req, res) => {
    try {
        const { book_id, member_id } = req.body;

        if (!book_id || !member_id) {
            return res.status(400).json({
                error: "book_id and member_id are required"
            });
        }

        const id = await borrowingModel.borrowBook(
            Number(book_id),
            Number(member_id)
        );

        res.status(201).json({
            message: "Book borrowed successfully",
            id
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

const returnBook = async (req, res) => {
    try {
        await borrowingModel.returnBook(req.params.id);

        res.json({
            message: "Book returned successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

module.exports = {
    getBorrowings,
    getBorrowing,
    borrowBook,
    returnBook
};