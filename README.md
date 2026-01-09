# JW News Parser - Node.js Edition

An automated web scraper that collects the latest videos, books, and news from JW.org and sends daily email updates with Bible reading schedules.

## Features

- 🔍 Scrapes latest videos, books, and news from JW.org
- 📧 Sends beautiful HTML email notifications
- 📖 Includes daily Bible reading schedule
- 🔄 Tracks history to avoid duplicate notifications
- ⚡ Built with modern Node.js and ES modules
- 🚀 Easy deployment with PM2

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- SMTP credentials (for sending emails)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd JW-News
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your SMTP credentials:
```env
SMTP_HOST=smtp-relay.sendinblue.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-smtp-password

FROM_EMAIL=JW Newsfeed <jworgnewsfeed@gmail.com>
TO_EMAIL=jworgnewsfeed@gmail.com

NODE_ENV=production
HEADLESS=true
```

4. Update the email list:
Edit `email_list.txt` and add recipient email addresses (one per line).

## Usage

### Run Once

To run the scraper immediately:
```bash
npm start
```

### Development Mode

Run with auto-reload on file changes:
```bash
npm run dev
```

### Scheduled Execution with PM2

For production deployment with scheduled daily runs:

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start ecosystem.config.cjs
```

3. Save the PM2 process list:
```bash
pm2 save
```

4. Setup PM2 to start on system boot:
```bash
pm2 startup
```

The application will now run automatically every day at 8 AM.

### PM2 Management Commands

```bash
# View logs
pm2 logs jw-news-parser

# Stop the application
pm2 stop jw-news-parser

# Restart the application
pm2 restart jw-news-parser

# Delete the application
pm2 delete jw-news-parser

# Monitor
pm2 monit
```

## Deployment Options

### 1. Traditional Server (VPS, EC2, etc.)

1. SSH into your server
2. Install Node.js and PM2
3. Clone the repository
4. Follow installation steps above
5. Use PM2 for process management

### 2. Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "index.js"]
```

Build and run:
```bash
docker build -t jw-news-parser .
docker run -d --env-file .env jw-news-parser
```

### 3. Cloud Functions (AWS Lambda, Google Cloud Functions)

The application can be adapted for serverless deployment:
- Set up a scheduled trigger (CloudWatch Events, Cloud Scheduler)
- Deploy the function with necessary dependencies
- Configure environment variables

### 4. Cron Job (Simple Server)

Add to crontab:
```bash
0 8 * * * cd /path/to/JW-News && /usr/bin/node index.js >> logs.txt 2>&1
```

## File Structure

```
JW-News/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── ecosystem.config.cjs  # PM2 configuration
├── .env.example          # Environment variables template
├── .env                  # Your environment variables (not in git)
├── history.json          # Tracks sent content
├── email_list.txt        # Email recipients
├── bible.txt             # Bible reading schedule
├── days.txt              # Daily reading links
├── main.html             # Email template header
├── reading.html          # Reading section template
├── video.html            # Video item template
├── news.html             # News item template
├── books.html            # Book item template
└── end.html              # Email template footer
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | smtp-relay.sendinblue.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `FROM_EMAIL` | Sender email address | JW Newsfeed <jworgnewsfeed@gmail.com> |
| `TO_EMAIL` | Primary recipient | jworgnewsfeed@gmail.com |
| `HEADLESS` | Run browser in headless mode | true |
| `NODE_ENV` | Environment | production |

### Customizing Schedule

Edit `ecosystem.config.cjs` to change the cron schedule:
```javascript
cron_restart: '0 8 * * *', // Run daily at 8 AM
```

Cron format: `minute hour day month weekday`

Examples:
- `0 8 * * *` - Every day at 8 AM
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8 AM

## Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:
```bash
# Install required dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or use puppeteer's bundled Chromium
npm install puppeteer
```

### Email Not Sending

- Verify SMTP credentials in `.env`
- Check firewall/security group allows outbound traffic on port 587
- Enable "Less secure app access" or use app-specific passwords for Gmail

### Permission Errors

Ensure the application has write permissions:
```bash
chmod +w history.json
```

## Security Notes

- Never commit `.env` file to version control
- Use app-specific passwords for email services
- Keep SMTP credentials secure
- Consider using a secrets manager for production

## Migration from Python

This is a complete rewrite of the original Python application with the following improvements:
- ✅ Cross-platform file paths
- ✅ Modern async/await syntax
- ✅ Better error handling
- ✅ Environment variable configuration
- ✅ Easier deployment options
- ✅ No hardcoded Windows paths

## License

MIT

## Support

For issues or questions, contact: jworgnewsfeed@gmail.com
