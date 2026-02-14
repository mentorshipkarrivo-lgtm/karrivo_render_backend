// services/zoomMeetingService.js
import axios from 'axios';
import ZoomMeeting from '../models/ZoomMeeting.js';

class ZoomMeetingService {
  constructor() {
    this.baseURL = 'https://api.zoom.us/v2';
    this.authURL = 'https://zoom.us/oauth/token';
  }

  /**
   * Generate access token using Server-to-Server OAuth
   */
  async generateAccessToken(accountId, clientId, clientSecret) {
    try {
      if (!accountId || !clientId || !clientSecret) {
        throw new Error('Missing Zoom OAuth credentials');
      }

      const base64Credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString('base64');

      const response = await axios.post(
        `${this.authURL}?grant_type=account_credentials&account_id=${accountId}`,
        null,
        {
          headers: {
            Authorization: `Basic ${base64Credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };
    } catch (error) {
      console.error(
        'Error generating access token:',
        error.response?.data || error.message
      );

      return {
        success: false,
        error: error.response?.data || 'Failed to generate access token'
      };
    }
  }

  /**
   * Create a Zoom meeting on Zoom API
   */
  async createMeetingOnZoom(accessToken, userId, meetingData) {
    try {
      const endpoint = `${this.baseURL}/users/${userId}/meetings`;

      const requestBody = {
        topic: meetingData.topic,
        type: meetingData.type || 2,
        start_time: meetingData.start_time,
        duration: meetingData.duration || 60,
        timezone: meetingData.timezone || 'UTC',
        password: meetingData.password || '',
        agenda: meetingData.agenda || '',
        settings: {
          host_video: meetingData.settings?.host_video ?? false,
          participant_video: meetingData.settings?.participant_video ?? false,
          join_before_host: meetingData.settings?.join_before_host ?? false,
          mute_upon_entry: meetingData.settings?.mute_upon_entry ?? true,
          waiting_room: meetingData.settings?.waiting_room ?? true,
          approval_type: meetingData.settings?.approval_type ?? 2,
          registration_type: meetingData.settings?.registration_type ?? 1,
          audio: meetingData.settings?.audio ?? 'both',
          auto_recording: meetingData.settings?.auto_recording ?? 'none',
          watermark: meetingData.settings?.watermark ?? false,
          use_pmi: meetingData.settings?.use_pmi ?? false
        }
      };

      if (
        (meetingData.type === 3 || meetingData.type === 8) &&
        meetingData.recurrence
      ) {
        requestBody.recurrence = {
          type: meetingData.recurrence.type,
          repeat_interval: meetingData.recurrence.repeatInterval,
          weekly_days: meetingData.recurrence.weeklyDays,
          monthly_day: meetingData.recurrence.monthlyDay,
          monthly_week: meetingData.recurrence.monthlyWeek,
          monthly_week_day: meetingData.recurrence.monthlyWeekDay,
          end_times: meetingData.recurrence.endTimes,
          end_date_time: meetingData.recurrence.endDateTime
        };
      }

      const response = await axios.post(endpoint, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        'Error creating meeting:',
        error.response?.data || error.message
      );

      return {
        success: false,
        error: error.response?.data || 'Failed to create meeting'
      };
    }
  }

  /**
   * UNIFIED METHOD: Create and save Zoom meeting
   * This replaces all duplicate logic across controllers
   */
  async createAndSaveMeeting(userId, meetingConfig) {
    try {
      // 1. Get Zoom credentials
      const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
      const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
      const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

      if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
        throw new Error('Zoom API credentials not configured');
      }

      // 2. Generate access token
      const tokenResult = await this.generateAccessToken(
        ZOOM_ACCOUNT_ID,
        ZOOM_CLIENT_ID,
        ZOOM_CLIENT_SECRET
      );

      if (!tokenResult.success) {
        throw new Error('Failed to generate Zoom access token');
      }

      // 3. Parse start time
      const startDateTime = this.parseTimeToDateTime(
        meetingConfig.sessionDate,
        meetingConfig.startTime
      );

      // 4. Prepare meeting data
      const meetingData = {
        topic: meetingConfig.topic || 'Session Meeting',
        type: 2, // Scheduled meeting
        start_time: startDateTime.toISOString(),
        duration: meetingConfig.duration || 60,
        timezone: meetingConfig.timezone || 'Asia/Kolkata',
        password: meetingConfig.password || `meet${Math.floor(100 + Math.random() * 900)}`,
        agenda: meetingConfig.agenda || `Session: ${meetingConfig.topic}`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2,
          audio: 'both',
          auto_recording: 'none',
          waiting_room: true,
          ...meetingConfig.settings
        }
      };

      // 5. Create meeting on Zoom
      const zoomResult = await this.createMeetingOnZoom(
        tokenResult.accessToken,
        'me',
        meetingData
      );

      if (!zoomResult.success) {
        throw new Error('Failed to create meeting on Zoom');
      }

      // 6. Save to database
      const zoomMeeting = new ZoomMeeting({
        userId,
        zoomMeetingId: zoomResult.data.id.toString(),
        uuid: zoomResult.data.uuid,
        topic: zoomResult.data.topic,
        type: zoomResult.data.type,
        startTime: zoomResult.data.start_time,
        duration: zoomResult.data.duration,
        timezone: zoomResult.data.timezone,
        password: zoomResult.data.password,
        agenda: zoomResult.data.agenda,
        joinUrl: zoomResult.data.join_url,
        startUrl: zoomResult.data.start_url,
        hostId: zoomResult.data.host_id,
        hostEmail: zoomResult.data.host_email,
        status: 'waiting',
        settings: {
          hostVideo: zoomResult.data.settings.host_video,
          participantVideo: zoomResult.data.settings.participant_video,
          cnMeeting: zoomResult.data.settings.cn_meeting,
          inMeeting: zoomResult.data.settings.in_meeting,
          joinBeforeHost: zoomResult.data.settings.join_before_host,
          muteUponEntry: zoomResult.data.settings.mute_upon_entry,
          watermark: zoomResult.data.settings.watermark,
          usePmi: zoomResult.data.settings.use_pmi,
          approvalType: zoomResult.data.settings.approval_type,
          registrationType: zoomResult.data.settings.registration_type,
          audio: zoomResult.data.settings.audio,
          autoRecording: zoomResult.data.settings.auto_recording,
          waitingRoom: zoomResult.data.settings.waiting_room
        },
        zoomResponse: zoomResult.data
      });

      await zoomMeeting.save();

      // 7. Return simplified meeting data
      return {
        success: true,
        meeting: {
          _id: zoomMeeting._id,
          zoomMeetingId: zoomMeeting.zoomMeetingId,
          joinUrl: zoomMeeting.joinUrl,
          startUrl: zoomMeeting.startUrl,
          password: zoomMeeting.password,
          topic: zoomMeeting.topic
        }
      };

    } catch (error) {
      console.error('Create and save meeting error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper: Parse time string to DateTime
   */
  parseTimeToDateTime(date, timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const dateTime = new Date(date);
    dateTime.setHours(hour24, minutes, 0, 0);

    return dateTime;
  }

  /**
   * Get meeting details
   */
  async getMeeting(accessToken, meetingId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data };
    }
  }

  /**
   * Update meeting
   */
  async updateMeeting(accessToken, meetingId, updateData) {
    try {
      await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updateData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data };
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(accessToken, meetingId) {
    try {
      await axios.delete(
        `${this.baseURL}/meetings/${meetingId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data };
    }
  }

  /**
   * List meetings
   */
  async listMeetings(accessToken, userId, type = 'scheduled') {
    try {
      const response = await axios.get(
        `${this.baseURL}/users/${userId}/meetings`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { type, page_size: 300 }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data };
    }
  }
}

export default new ZoomMeetingService();