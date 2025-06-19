
# Codeforces Student Tracker - Backend

This is the backend service for the Codeforces Student Tracker application, providing data synchronization, inactivity detection, and email notification features.

## Features

- **Real-time Codeforces Data Sync**: Automatically fetch student ratings, contests, and submissions
- **Scheduled Sync**: Configurable daily/weekly automatic synchronization
- **Inactivity Detection**: Monitor student activity and send reminder emails
- **Email Notifications**: Automated email reminders for inactive students
- **RESTful API**: Complete API for frontend integration
- **MongoDB Storage**: Persistent data storage with efficient querying

## Quick Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Gmail account or SMTP server for emails

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codeforces-sync
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:8080
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/sync` - Manual sync student data

### Sync Management
- `GET /api/sync/settings` - Get sync configuration
- `POST /api/sync/settings` - Update sync settings
- `GET /api/sync/status` - Get sync status
- `POST /api/sync/manual` - Trigger manual sync
- `GET /api/sync/logs` - Get sync history

### Email Management  
- `GET /api/emails/logs` - Get email history
- `GET /api/emails/stats` - Get email statistics
- `POST /api/emails/test` - Send test email

## Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## Sync Configuration

The system supports:
- **Daily sync**: Every day at specified time
- **Weekly sync**: Every Sunday at specified time  
- **Manual sync**: Triggered via API or UI
- **Real-time sync**: When student CF handle changes

## Inactivity Detection

- Monitors student submissions automatically
- Detects inactivity after 7 days (configurable)
- Sends up to 3 email reminders per student
- Respects per-student email preferences

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name codeforces-backend
   ```

## Monitoring

- Health check: `GET /api/health`
- Sync logs: `GET /api/sync/logs`
- Email stats: `GET /api/emails/stats`
- Server logs in console

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env
   - Check network connectivity for Atlas

2. **Email Sending Failed**
   - Verify Gmail App Password
   - Check EMAIL_* environment variables
   - Ensure 2FA is enabled on Gmail

3. **Codeforces API Errors**
   - API has rate limits (1 request/second)
   - Some handles may be private/invalid
   - Check internet connectivity

4. **Sync Not Working**
   - Check sync settings in database
   - Verify cron expressions
   - Check server timezone settings

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

## Architecture

```
├── src/
│   ├── models/          # MongoDB schemas
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints  
│   ├── config/          # Database config
│   └── server.ts        # Express server
├── dist/                # Compiled JavaScript
└── package.json         # Dependencies
```

## Performance Tips

- Use MongoDB indexes for faster queries
- Configure proper connection pooling  
- Monitor memory usage during large syncs
- Set up log rotation for production
- Use environment-specific configurations

For frontend integration, make sure to set `VITE_API_BASE_URL=http://localhost:5000/api` in your frontend environment.
