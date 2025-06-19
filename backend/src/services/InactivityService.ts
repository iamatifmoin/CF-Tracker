import Student from "../models/Student";
import EmailService from "./EmailService";

export class InactivityService {
  static async detectAndNotifyInactiveStudents(): Promise<void> {
    console.log("🔍 Detecting inactive students...");

    const students = await Student.find({ emailRemindersEnabled: true });
    const currentTime = new Date();
    const inactivityThreshold = 7; // days

    let inactiveCount = 0;
    let notificationsSent = 0;

    for (const student of students) {
      let isInactive = false;
      let inactiveDays = 0;

      if (student.lastActivityDate) {
        const daysSinceLastActivity = Math.floor(
          (currentTime.getTime() - student.lastActivityDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        isInactive = daysSinceLastActivity >= inactivityThreshold;
        inactiveDays = daysSinceLastActivity;
      } else {
        // No activity recorded, check how long since account creation
        const daysSinceCreation = Math.floor(
          (currentTime.getTime() - student.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        isInactive = daysSinceCreation >= inactivityThreshold;
        inactiveDays = daysSinceCreation;
      }

      // Update student inactivity status
      student.isInactive = isInactive;
      student.inactiveDays = inactiveDays;
      await student.save();

      if (isInactive) {
        inactiveCount++;

        // Send reminder email if enabled and not sent recently
        const shouldSendReminder = await this.shouldSendInactivityReminder(
          student
        );
        if (shouldSendReminder) {
          try {
            await EmailService.sendInactivityReminder(student);
            student.emailReminderCount++;
            await student.save();
            notificationsSent++;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);

            console.error(
              `❌ Failed to send inactivity reminder to ${student.email}:`,
              message
            );
          }
        }
      }
    }

    console.log(
      `🔍 Inactivity detection completed: ${inactiveCount} inactive students, ${notificationsSent} notifications sent`
    );
  }

  private static async shouldSendInactivityReminder(
    student: any
  ): Promise<boolean> {
    // Don't send more than 3 reminders total
    if (student.emailReminderCount >= 3) {
      return false;
    }

    // Don't send reminders more than once per week
    const lastEmailLog = await EmailService.getLastEmailLog(
      student._id,
      "inactivity"
    );
    if (lastEmailLog) {
      const daysSinceLastEmail = Math.floor(
        (Date.now() - lastEmailLog.sentAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastEmail >= 7;
    }

    return true;
  }

  static async getInactiveStudentsStats(): Promise<{
    total: number;
    inactive: number;
    averageInactiveDays: number;
  }> {
    const totalStudents = await Student.countDocuments();
    const inactiveStudents = await Student.find({ isInactive: true });

    const averageInactiveDays =
      inactiveStudents.length > 0
        ? inactiveStudents.reduce(
            (sum, student) => sum + student.inactiveDays,
            0
          ) / inactiveStudents.length
        : 0;

    return {
      total: totalStudents,
      inactive: inactiveStudents.length,
      averageInactiveDays: Math.round(averageInactiveDays),
    };
  }
}
