import cron from "node-cron";
import SyncService from "./SyncService";
import SyncSettings from "../models/SyncSettings";

export type ISchedulerService = SchedulerService;

class SchedulerService {
  async initializeScheduler(): Promise<void> {
    console.log("Initializing...");
  }
  private scheduledTask: cron.ScheduledTask | null = null;
  private isTaskRunning = false;
  private nextRunTime: Date | null = null;

  async updateSchedule(settings: any): Promise<void> {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
    }

    if (!settings.isEnabled) {
      this.isTaskRunning = false;
      this.nextRunTime = null;
      console.log("📴 Sync scheduler disabled");
      return;
    }

    const [hour, minute] = settings.time.split(":").map(Number);

    const cronExpression =
      settings.frequency === "daily"
        ? `${minute} ${hour} * * *`
        : `${minute} ${hour} * * 0`; // weekly: Sunday

    this.nextRunTime = this.computeNextRun(cronExpression, settings.timezone);
    this.isTaskRunning = true;

    this.scheduledTask = cron.schedule(
      cronExpression,
      async () => {
        console.log("🚀 Triggered scheduled sync");
        try {
          await SyncService.syncAllStudents();
          await SyncSettings.findOneAndUpdate({}, { lastSync: new Date() });

          // Update the next run time
          this.nextRunTime = this.computeNextRun(
            cronExpression,
            settings.timezone
          );
        } catch (error) {
          console.error("❌ Scheduled sync failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: settings.timezone,
      }
    );

    console.log(
      `⏰ Scheduled ${settings.frequency} sync at ${settings.time} (${cronExpression})`
    );
  }

  async getSyncSettings(): Promise<any> {
    return (await SyncSettings.findOne()) || new SyncSettings();
  }

  async updateSyncSettings(updates: Partial<any>): Promise<any> {
    const settings = await SyncSettings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
    });
    await this.updateSchedule(settings);
    return settings;
  }

  getScheduleStatus(): { isRunning: boolean; nextRun: string | null } {
    return {
      isRunning: this.isTaskRunning,
      nextRun: this.nextRunTime?.toISOString() || null,
    };
  }

  private computeNextRun(cronExpression: string, timezone: string): Date {
    const cronParser = require("cron-parser");
    const interval = cronParser.parseExpression(cronExpression, {
      tz: timezone,
    });
    return interval.next().toDate();
  }
}

const schedulerService = new SchedulerService();
export default schedulerService;
