import Student, { IStudent } from "../models/Student";
import CodeforcesData from "../models/CodeforcesData";
import SyncLog from "../models/SyncLog";
import CodeforcesService from "./CodeforcesService";
import { InactivityService } from "./InactivityService";

export class SyncService {
  async syncAllStudents(): Promise<void> {
    console.log("🔄 Starting full sync of all students...");

    const syncLog = new SyncLog({
      operation: "full_sync",
      status: "success",
      triggeredBy: "scheduled",
      errors: [],
    });

    try {
      const students = await Student.find({});
      syncLog.studentsProcessed = students.length;

      for (const student of students) {
        try {
          await this.syncStudent(student);
          syncLog.studentsSuccessful++;
        } catch (error) {
          syncLog.studentsFailed++;

          const message =
            error instanceof Error ? error.message : String(error);

          syncLog.errors.push(`${student.codeforcesHandle}: ${message}`);

          console.error(
            `❌ Failed to sync ${student.codeforcesHandle}:`,
            message
          );
        }
      }

      // Run inactivity detection after sync
      await InactivityService.detectAndNotifyInactiveStudents();

      syncLog.endTime = new Date();
      if (syncLog.studentsFailed > 0) {
        syncLog.status = syncLog.studentsSuccessful > 0 ? "partial" : "failed";
      }

      await syncLog.save();
      console.log(
        `✅ Full sync completed: ${syncLog.studentsSuccessful}/${syncLog.studentsProcessed} successful`
      );
    } catch (error) {
      syncLog.status = "failed";
      syncLog.endTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      syncLog.errors.push(`Full sync error: ${message}`);
      await syncLog.save();
      throw error;
    }
  }

  async syncStudent(student: IStudent): Promise<void> {
    console.log(`🔄 Syncing student: ${student.codeforcesHandle}`);

    student.lastSyncAttempt = new Date();
    student.syncStatus = "pending";

    try {
      // Fetch user info and rating
      const userInfo = await CodeforcesService.getUserInfo(
        student.codeforcesHandle
      );
      const ratingHistory = await CodeforcesService.getUserRating(
        student.codeforcesHandle
      );
      const submissions = await CodeforcesService.getUserSubmissions(
        student.codeforcesHandle
      );

      // Update student ratings
      student.currentRating = userInfo.rating || 0;
      student.maxRating = userInfo.maxRating || 0;
      student.lastUpdated = new Date();
      student.syncStatus = "success";
      student.syncError = undefined;

      // Find last activity date
      if (submissions.length > 0) {
        const lastSubmission = submissions.reduce((latest, current) =>
          current.creationTimeSeconds > latest.creationTimeSeconds
            ? current
            : latest
        );
        student.lastActivityDate = new Date(
          lastSubmission.creationTimeSeconds * 1000
        );
      }

      await student.save();

      // Store/update codeforces data
      await CodeforcesData.findOneAndUpdate(
        { studentId: student._id },
        {
          studentId: student._id,
          handle: student.codeforcesHandle,
          userInfo: userInfo,
          contests: ratingHistory,
          submissions: submissions,
          problems: [], // We can fetch problems separately if needed
          lastFetched: new Date(),
        },
        { upsert: true }
      );

      console.log(`✅ Successfully synced ${student.codeforcesHandle}`);
    } catch (error) {
      student.syncStatus = "error";
      if (error instanceof Error) {
        student.syncError = error.message;
      } else {
        student.syncError = String(error);
      }
      await student.save();
      throw error;
    }
  }

  async syncStudentByHandle(handle: string): Promise<void> {
    const student = await Student.findOne({ codeforcesHandle: handle });
    if (!student) {
      throw new Error(`Student with handle ${handle} not found`);
    }
    await this.syncStudent(student);
  }

  async syncStudentById(studentId: string): Promise<void> {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }
    await this.syncStudent(student);
  }
}

export default new SyncService();
