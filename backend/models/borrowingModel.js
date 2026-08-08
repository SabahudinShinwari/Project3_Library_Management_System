const db = require("../config/db");

// Get all borrowing records
const getAllBorrowings = async () => {
    const [rows] = await db.query(`
        SELECT
            borrowings.id,
            books.title AS book_title,
            members.name AS member_name,
            members.email AS member_email,
            borrowings.borrow_date,
            borrowings.return_date,
            borrowings.status
        FROM borrowings
        INNER JOIN books ON borrowings.book_id = books.id
        INNER JOIN members ON borrowings.member_id = members.id
        ORDER BY borrowings.id DESC
    `);

    return rows;
};

// Get one borrowing record
const getBorrowingById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            borrowings.id,
            borrowings.book_id,
            borrowings.member_id,
            books.title AS book_title,
            members.name AS member_name,
            borrowings.borrow_date,
            borrowings.return_date,
            borrowings.status
        FROM borrowings
        INNER JOIN books ON borrowings.book_id = books.id
        INNER JOIN members ON borrowings.member_id = members.id
        WHERE borrowings.id = ?
    `, [id]);

    return rows[0];
};

// Borrow a book
const borrowBook = async (bookId, memberId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check whether the book exists and is available
        const [books] = await connection.query(
            `SELECT available_quantity
             FROM books
             WHERE id = ?
             FOR UPDATE`,
            [bookId]
        );

        if (books.length === 0) {
            throw new Error("Book not found");
        }

        if (books[0].available_quantity <= 0) {
            throw new Error("Book is currently unavailable");
        }

        // Check whether the member exists
        const [members] = await connection.query(
            `SELECT id
             FROM members
             WHERE id = ?`,
            [memberId]
        );

        if (members.length === 0) {
            throw new Error("Member not found");
        }

        // Create borrowing record
        const [result] = await connection.query(
            `INSERT INTO borrowings
             (book_id, member_id, borrow_date, status)
             VALUES (?, ?, CURDATE(), 'Borrowed')`,
            [bookId, memberId]
        );

        // Reduce available quantity
        await connection.query(
            `UPDATE books
             SET available_quantity = available_quantity - 1
             WHERE id = ?`,
            [bookId]
        );

        await connection.commit();

        return result.insertId;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

// Return a book
const returnBook = async (id) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Find the borrowing record
        const [borrowings] = await connection.query(
            `SELECT book_id, status
             FROM borrowings
             WHERE id = ?
             FOR UPDATE`,
            [id]
        );

        if (borrowings.length === 0) {
            throw new Error("Borrowing record not found");
        }

        if (borrowings[0].status === "Returned") {
            throw new Error("This book has already been returned");
        }

        const bookId = borrowings[0].book_id;

        // Update borrowing record
        await connection.query(
            `UPDATE borrowings
             SET return_date = CURDATE(),
                 status = 'Returned'
             WHERE id = ?`,
            [id]
        );

        // Increase available quantity
        await connection.query(
            `UPDATE books
             SET available_quantity = available_quantity + 1
             WHERE id = ?`,
            [bookId]
        );

        await connection.commit();

        return true;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    getAllBorrowings,
    getBorrowingById,
    borrowBook,
    returnBook
};