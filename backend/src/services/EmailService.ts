import nodemailer from "nodemailer";
import EmailLog, { IEmailLog } from "../models/EmailLog";
import { IStudent } from "../models/Student";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendInactivityReminder(student: IStudent): Promise<void> {
    const subject = `Codeforces Activity Reminder - ${student.inactiveDays} days inactive`;
    const htmlContent = this.generateInactivityEmail(student);

    await this.sendEmail(
      student.email,
      subject,
      htmlContent,
      student._id,
      "inactivity"
    );
  }

  async sendSyncErrorNotification(
    student: IStudent,
    error: string
  ): Promise<void> {
    const subject = `Codeforces Sync Error - ${student.codeforcesHandle}`;
    const htmlContent = this.generateSyncErrorEmail(student, error);

    await this.sendEmail(
      student.email,
      subject,
      htmlContent,
      student._id,
      "sync_error"
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    studentId: any,
    reminderType: "inactivity" | "sync_error"
  ): Promise<void> {
    const emailLog = new EmailLog({
      studentId,
      emailAddress: to,
      subject,
      reminderType,
      status: "sent",
    });

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });

      await emailLog.save();
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      emailLog.status = "failed";
      const message = error instanceof Error ? error.message : String(error);

      emailLog.error = message;
      await emailLog.save();
      throw error;
    }
  }

  private generateInactivityEmail(student: IStudent): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e53e3e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7fafc; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; padding: 12px 24px; background: #38a169; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Codeforces Activity Reminder</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name}!</h2>
            <p>We noticed you haven't been active on Codeforces for <strong>${
              student.inactiveDays
            } days</strong>.</p>
            <p>Your Codeforces handle: <strong>@${
              student.codeforcesHandle
            }</strong></p>
            <p>Current rating: <strong>${student.currentRating}</strong></p>
            <p>Regular practice is key to improving your competitive programming skills!</p>

            <a href="https://codeforces.com/problemset" class="cta-button">Practice Problems</a>
            <a href="https://codeforces.com/profile/${
              student.codeforcesHandle
            }" class="cta-button">View Your Profile</a>

            <p><small>This is reminder #${
              student.emailReminderCount + 1
            } of 3. You can disable these reminders by contacting your administrator.</small></p>
          </div>
          <div class="footer">
            <p>Sent by Codeforces Student Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSyncErrorEmail(student: IStudent, error: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e53e3e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7fafc; }
          .error { background: #fed7d7; border: 1px solid #fc8181; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Sync Error Notification</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>We encountered an error while syncing your Codeforces data:</p>
            <div class="error">
              <strong>Error:</strong> ${error}
            </div>
            <p>Handle: <strong>@${student.codeforcesHandle}</strong></p>
            <p>Please check if your Codeforces handle is correct and publicly accessible.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async getLastEmailLog(
    studentId: any,
    reminderType: string
  ): Promise<IEmailLog | null> {
    return await EmailLog.findOne({
      studentId,
      reminderType,
      status: "sent",
    }).sort({ sentAt: -1 });
  }

  async getEmailStats(): Promise<{
    totalSent: number;
    totalFailed: number;
    inactivityReminders: number;
    syncErrorNotifications: number;
  }> {
    const [sent, failed, inactivity, syncError] = await Promise.all([
      EmailLog.countDocuments({ status: "sent" }),
      EmailLog.countDocuments({ status: "failed" }),
      EmailLog.countDocuments({ reminderType: "inactivity", status: "sent" }),
      EmailLog.countDocuments({ reminderType: "sync_error", status: "sent" }),
    ]);

    return {
      totalSent: sent,
      totalFailed: failed,
      inactivityReminders: inactivity,
      syncErrorNotifications: syncError,
    };
  }
}

export default new EmailService();
