const memberModel = require("../models/memberModel");

const getMembers = async (req, res) => {
    try {
        const members = await memberModel.getAllMembers();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMember = async (req, res) => {
    try {
        const member = await memberModel.getMemberById(req.params.id);

        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMember = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const id = await memberModel.createMember(
            name,
            email,
            phone || null
        );

        res.status(201).json({
            message: "Member created successfully",
            id
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

const updateMember = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const affectedRows = await memberModel.updateMember(
            req.params.id,
            name,
            email,
            phone || null
        );

        if (!affectedRows) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.json({ message: "Member updated successfully" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

const deleteMember = async (req, res) => {
    try {
        const affectedRows = await memberModel.deleteMember(req.params.id);

        if (!affectedRows) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.json({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember
};