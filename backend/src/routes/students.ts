import express from "express";
import Student from "../models/Student";
import CodeforcesData from "../models/CodeforcesData";
import SyncService from "../services/SyncService";
import CodeforcesService from "../services/CodeforcesService";

const router = express.Router();

// GET /api/students - Get all students with their sync status
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// GET /api/students/:id - Get single student with Codeforces data
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const codeforcesData = await CodeforcesData.findOne({
      studentId: student._id,
    });

    res.json({
      student,
      codeforcesData: codeforcesData || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/students - Create new student
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, codeforcesHandle } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !codeforcesHandle) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate Codeforces handle
    const isValidHandle = await CodeforcesService.validateHandle(
      codeforcesHandle
    );
    if (!isValidHandle) {
      return res.status(400).json({ error: "Invalid Codeforces handle" });
    }

    // Check for duplicates
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }],
    });

    if (existingStudent) {
      return res
        .status(400)
        .json({
          error: "Student with this email or Codeforces handle already exists",
        });
    }

    const student = new Student({
      name,
      email,
      phone,
      codeforcesHandle,
    });

    await student.save();

    // Trigger initial sync in background
    setTimeout(async () => {
      try {
        await SyncService.syncStudent(student);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Initial sync failed for ${codeforcesHandle}:`, message);
      }
    }, 1000);

    res.status(201).json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// PUT /api/students/:id - Update student
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { name, email, phone, codeforcesHandle, emailRemindersEnabled } =
      req.body;
    const oldHandle = student.codeforcesHandle;

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (emailRemindersEnabled !== undefined)
      student.emailRemindersEnabled = emailRemindersEnabled;

    // Handle Codeforces handle change
    if (codeforcesHandle && codeforcesHandle !== oldHandle) {
      const isValidHandle = await CodeforcesService.validateHandle(
        codeforcesHandle
      );
      if (!isValidHandle) {
        return res.status(400).json({ error: "Invalid Codeforces handle" });
      }

      const existingStudent = await Student.findOne({
        codeforcesHandle,
        _id: { $ne: student._id },
      });

      if (existingStudent) {
        return res
          .status(400)
          .json({
            error: "Another student with this Codeforces handle already exists",
          });
      }

      student.codeforcesHandle = codeforcesHandle;

      // Trigger sync for new handle
      setTimeout(async () => {
        try {
          await SyncService.syncStudent(student);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(
            `Handle change sync failed for ${codeforcesHandle}:`,
            message
          );
        }
      }, 1000);
    }

    await student.save();
    res.json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// DELETE /api/students/:id - Delete student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Also delete associated Codeforces data
    await CodeforcesData.deleteOne({ studentId: student._id });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/students/:id/sync - Manual sync for specific student
router.post("/:id/sync", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await SyncService.syncStudent(student);

    const updatedStudent = await Student.findById(req.params.id);
    res.json(updatedStudent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/students/:id/email-toggle - Toggle email reminders
router.post("/:id/email-toggle", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.emailRemindersEnabled = !student.emailRemindersEnabled;
    await student.save();

    res.json({
      emailRemindersEnabled: student.emailRemindersEnabled,
      message: `Email reminders ${
        student.emailRemindersEnabled ? "enabled" : "disabled"
      }`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
