const db = require("../config/db");

// Get all members
const getAllMembers = async () => {
    const [rows] = await db.query(
        "SELECT * FROM members ORDER BY id DESC"
    );

    return rows;
};

// Get one member
const getMemberById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM members WHERE id = ?",
        [id]
    );

    return rows[0];
};

// Create member
const createMember = async (name, email, phone) => {
    const [result] = await db.query(
        `INSERT INTO members (name, email, phone)
         VALUES (?, ?, ?)`,
        [name, email, phone]
    );

    return result.insertId;
};

// Update member
const updateMember = async (id, name, email, phone) => {
    const [result] = await db.query(
        `UPDATE members
         SET name = ?, email = ?, phone = ?
         WHERE id = ?`,
        [name, email, phone, id]
    );

    return result.affectedRows;
};

// Delete member
const deleteMember = async (id) => {
    const [result] = await db.query(
        "DELETE FROM members WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
};