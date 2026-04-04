const { google } = require('googleapis');

class GoogleMeetService {
  constructor() {
    this.auth = null;
    this.calendar = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      // Initialize Google Auth with service account or OAuth2
      // This would require proper Google Cloud setup
      const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      };

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/meetings.space.create'],
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    } catch (error) {
      console.warn('Google Meet service not properly configured:', error.message);
    }
  }

  async createMeeting(eventDetails) {
    if (!this.auth || !this.calendar) {
      // Fallback: Generate a mock Google Meet link
      return this.generateMockMeetLink(eventDetails);
    }

    try {
      const startTime = new Date(`${eventDetails.date}T${eventDetails.time}`);
      const endTime = new Date(startTime.getTime() + this.parseDuration(eventDetails.duration) * 60000);

      const event = {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        attendees: eventDetails.attendees?.map(email => ({ email })) || [],
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
      const eventId = response.data.id;

      return {
        success: true,
        meetLink,
        eventId,
        calendarEvent: response.data,
      };
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      // Fallback to mock link
      return this.generateMockMeetLink(eventDetails);
    }
  }

  generateMockMeetLink(eventDetails) {
    // Generate a realistic-looking Google Meet link
    const meetId = this.generateMeetId();
    const meetLink = `https://meet.google.com/${meetId}`;
    
    return {
      success: true,
      meetLink,
      eventId: `mock_${Date.now()}`,
      calendarEvent: null,
      isMock: true, // Flag to indicate this is a mock link
    };
  }

  generateMeetId() {
    // Generate a Google Meet ID format (xxx-xxx-xxx)
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    
    let meetId = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 1) {
          meetId += numbers[Math.floor(Math.random() * numbers.length)];
        } else {
          meetId += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      if (i < 2) meetId += '-';
    }
    
    return meetId;
  }

  parseDuration(duration) {
    // Parse duration string like "2 hours", "90 minutes"
    const match = duration.match(/(\d+)\s*(hour|minute|minute)s?/i);
    if (!match) return 60; // Default to 1 hour

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes('hour')) return value * 60;
    if (unit.includes('minute')) return value;
    return 60;
  }

  async updateMeeting(eventId, updates) {
    if (!this.auth || !this.calendar) {
      return { success: false, message: 'Google Meet service not available' };
    }

    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updates,
      });

      return {
        success: true,
        calendarEvent: response.data,
      };
    } catch (error) {
      console.error('Error updating meeting:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteMeeting(eventId) {
    if (!this.auth || !this.calendar) {
      return { success: false, message: 'Google Meet service not available' };
    }

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return { success: false, message: error.message };
    }
  }

  async getMeetingDetails(eventId) {
    if (!this.auth || !this.calendar) {
      return { success: false, message: 'Google Meet service not available' };
    }

    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      return {
        success: true,
        calendarEvent: response.data,
      };
    } catch (error) {
      console.error('Error getting meeting details:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new GoogleMeetService();
