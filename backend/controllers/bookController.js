const bookModel = require("../models/bookModel");

const getBooks = async (req, res) => {
    try {
        const books = await bookModel.getAllBooks();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBook = async (req, res) => {
    try {
        const book = await bookModel.getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, author, category, quantity } = req.body;

        if (!title || !author || !category || quantity === undefined) {
            return res.status(400).json({
                error: "Title, author, category and quantity are required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                error: "Quantity must be a non-negative integer"
            });
        }

        const id = await bookModel.createBook(
            title,
            author,
            category,
            Number(quantity)
        );

        res.status(201).json({
            message: "Book created successfully",
            id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBook = async (req, res) => {
    try {
        const { title, author, category, quantity } = req.body;

        if (!title || !author || !category || quantity === undefined) {
            return res.status(400).json({
                error: "All book fields are required"
            });
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({
                error: "Quantity must be a non-negative integer"
            });
        }

        const affectedRows = await bookModel.updateBook(
            req.params.id,
            title,
            author,
            category,
            Number(quantity)
        );

        if (!affectedRows) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Book updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const affectedRows = await bookModel.deleteBook(req.params.id);

        if (!affectedRows) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
};