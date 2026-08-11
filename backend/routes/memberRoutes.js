const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember
} = require("../controllers/memberController");

// GET all members
// Admin only
router.get("/", authenticateToken, requireAdmin, getMembers);

// GET one member
// Admin only
router.get("/:id", authenticateToken, requireAdmin, getMember);

// CREATE member
// Admin only
router.post("/", authenticateToken, requireAdmin, createMember);

// UPDATE member
// Admin only
router.put("/:id", authenticateToken, requireAdmin, updateMember);

// DELETE member
// Admin only
router.delete("/:id", authenticateToken, requireAdmin, deleteMember);

module.exports = router;