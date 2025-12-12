import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import pool from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Update Preferences
router.put("/preferences", authenticateToken, async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;

        await pool.query(
            `UPDATE users SET preferences = $1 WHERE id = $2`,
            [preferences, userId]
        );

        res.json({ message: "Preferences updated successfully", preferences });
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ error: "Failed to update preferences" });
    }
});

// Change Password
router.put("/password", authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ error: "User not found" });

        // Verify current password
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            return res.status(400).json({ error: "Invalid current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Failed to update password" });
    }
});

export default router;
