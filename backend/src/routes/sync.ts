import express from "express";
import SyncService from "../services/SyncService";
import SchedulerService from "../services/SchedulerService";
import SyncLog from "../models/SyncLog";
import { InactivityService } from "../services/InactivityService";

const router = express.Router();

// GET /api/sync/settings - Get sync settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await SchedulerService.getSyncSettings();
    const scheduleStatus = SchedulerService.getScheduleStatus();

    res.json({
      ...settings.toObject(),
      scheduleStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/sync/settings - Update sync settings
router.post("/settings", async (req, res) => {
  try {
    const {
      frequency,
      time,
      timezone,
      isEnabled,
      inactivityThresholdDays,
      emailReminderEnabled,
    } = req.body;

    const settings = await SchedulerService.updateSyncSettings({
      frequency,
      time,
      timezone,
      isEnabled,
      inactivityThresholdDays,
      emailReminderEnabled,
    });

    const scheduleStatus = SchedulerService.getScheduleStatus();

    res.json({
      ...settings.toObject(),
      scheduleStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// GET /api/sync/status - Get current sync status
router.get("/status", async (req, res) => {
  try {
    const settings = await SchedulerService.getSyncSettings();
    const scheduleStatus = SchedulerService.getScheduleStatus();
    const lastSyncLog = await SyncLog.findOne().sort({ startTime: -1 });
    const inactivityStats = await InactivityService.getInactiveStudentsStats();

    res.json({
      syncSettings: settings,
      scheduleStatus,
      lastSync: lastSyncLog,
      inactivityStats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// POST /api/sync/manual - Trigger manual sync
router.post("/manual", async (req, res) => {
  try {
    // Start sync in background
    setTimeout(async () => {
      try {
        await SyncService.syncAllStudents();
      } catch (error) {
        console.error("Manual sync failed:", error);
      }
    }, 1000);

    res.json({
      message: "Manual sync started",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// GET /api/sync/logs - Get sync logs
router.get("/logs", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const logs = await SyncLog.find()
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SyncLog.countDocuments();

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

// POST /api/sync/inactivity-check - Trigger manual inactivity check
router.post("/inactivity-check", async (req, res) => {
  try {
    setTimeout(async () => {
      try {
        await InactivityService.detectAndNotifyInactiveStudents();
      } catch (error) {
        console.error("Manual inactivity check failed:", error);
      }
    }, 1000);

    res.json({
      message: "Inactivity check started",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;
