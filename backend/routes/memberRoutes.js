const express = require("express");

const router = express.Router();

const {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember
} = require("../controllers/memberController");

// GET all members
router.get("/", getMembers);

// GET one member
router.get("/:id", getMember);

// CREATE member
router.post("/", createMember);

// UPDATE member
router.put("/:id", updateMember);

// DELETE member
router.delete("/:id", deleteMember);

module.exports = router;