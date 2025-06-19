import express from "express";
import EmailLog from "../models/EmailLog";
import EmailService from "../services/EmailService";
import Student from "../models/Student";

const router = express.Router();

// GET /api/emails/logs - Get email logs
router.get("/logs", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const logs = await EmailLog.find()
      .populate("studentId", "name email codeforcesHandle")
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EmailLog.countDocuments();

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// GET /api/emails/stats - Get email statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await EmailService.getEmailStats();
    res.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// GET /api/emails/student/:id - Get email logs for specific student
router.get("/student/:id", async (req, res) => {
  try {
    const logs = await EmailLog.find({ studentId: req.params.id })
      .sort({ sentAt: -1 })
      .limit(10);

    res.json(logs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/emails/test - Send test email
router.post("/test", async (req, res) => {
  try {
    const { studentId, type } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (type === "inactivity") {
      await EmailService.sendInactivityReminder(student);
    } else if (type === "sync_error") {
      await EmailService.sendSyncErrorNotification(
        student,
        "Test sync error notification"
      );
    } else {
      return res.status(400).json({ error: "Invalid email type" });
    }

    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
