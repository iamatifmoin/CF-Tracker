
import axios from 'axios';

export interface CodeforcesUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId: number;
    members: Array<{ handle: string }>;
    participantType: string;
    ghost: boolean;
    startTimeSeconds: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export class CodeforcesService {
  private baseUrl = process.env.CODEFORCES_API_BASE || 'https://codeforces.com/api';
  private requestDelay = 1000; // 1 second delay between requests to respect rate limits

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      await this.delay(this.requestDelay);
      
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        timeout: 10000
      });
      
      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        throw new Error(`Codeforces API error: ${response.data.comment}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid Codeforces handle or user not found');
        }
        if (error.response?.status === 503) {
          throw new Error('Codeforces API temporarily unavailable');
        }
      }
      throw error;
    }
  }

  async getUserInfo(handle: string): Promise<CodeforcesUser> {
    const users = await this.makeRequest(`/user.info?handles=${handle}`);
    return users[0];
  }

  async getUserRating(handle: string): Promise<any[]> {
    try {
      return await this.makeRequest(`/user.rating?handle=${handle}`);
    } catch (error) {
      // User might not have participated in any rated contests
      return [];
    }
  }

  async getUserSubmissions(handle: string, from: number = 1, count: number = 1000): Promise<CodeforcesSubmission[]> {
    try {
      return await this.makeRequest(`/user.status?handle=${handle}&from=${from}&count=${count}`);
    } catch (error) {
      // User might not have any submissions
      return [];
    }
  }

  async getRecentSubmissions(handle: string, days: number = 7): Promise<CodeforcesSubmission[]> {
    const submissions = await this.getUserSubmissions(handle);
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    return submissions.filter(submission => 
      submission.creationTimeSeconds >= cutoffTime
    );
  }

  async validateHandle(handle: string): Promise<boolean> {
    try {
      await this.getUserInfo(handle);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new CodeforcesService();
