## CF Tracker

A web application for tracking activity on Codeforces, with automated data synchronization and inactivity monitoring.

## Video Demonstration

[Click Here](https://www.loom.com/share/a56064e522144921aa84323984b5355e)

## Key Features

- Student Management: Add, edit, and manage student profiles with Codeforces handles
- Automated Data Sync: Regularly fetch student ratings, contest participation, and submissions from Codeforces API
- Inactivity Detection: Automatically detect students who haven't submitted solutions in 7+ days
- Email Notifications: Send automated reminder emails to inactive students
- Real-time Updates: Live sync status and progress tracking
- Admin Dashboard: Configure sync settings adn view detailed info

## Technology Stack

Frontend:

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- React Query for data fetching
- React Router for navigation
- Axios for API communication

Backend:

- Node.js + Express.js + TypeScript
- MongoDB with Mongoose ODM
- node-cron for scheduled tasks
- Nodemailer for email services
- Codeforces API integration

## Setup Instructions

Frontend Setup
Install dependencies:

```
npm install
```

Configure environment:

```
cp .env.example .env
```

Edit .env and set:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Start development server:

```
npm run dev
Backend Setup
```

Navigate to backend directory:

```
cd backend
```

Install dependencies:

```
npm install
```

Configure environment:

```
cp .env.example .env
```

Edit .env and configure:

```
MONGODB_URI=mongodb://localhost:27017/codeforces-tracker
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
PORT=5000
```

Update MONGODB_URI in .env

Start backend server:

```
npm run dev
```
