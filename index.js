import puppeteer from 'puppeteer';
import Parser from 'rss-parser';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  smtpHost: process.env.SMTP_HOST || 'smtp-relay.sendinblue.com',
  smtpPort: parseInt(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || 'camster91@gmail.com',
  smtpPass: process.env.SMTP_PASS || '0h65mJPSk7Iz4Dwn',
  fromEmail: process.env.FROM_EMAIL || 'JW Newsfeed <jworgnewsfeed@gmail.com>',
  toEmail: process.env.TO_EMAIL || 'jworgnewsfeed@gmail.com',
  headless: process.env.HEADLESS !== 'false',
  historyFile: path.join(__dirname, 'history.json'),
  emailListFile: path.join(__dirname, 'email_list.txt'),
  bibleFile: path.join(__dirname, 'bible.txt'),
  daysFile: path.join(__dirname, 'days.txt'),
  templates: {
    main: path.join(__dirname, 'main.html'),
    reading: path.join(__dirname, 'reading.html'),
    video: path.join(__dirname, 'video.html'),
    news: path.join(__dirname, 'news.html'),
    books: path.join(__dirname, 'books.html'),
    end: path.join(__dirname, 'end.html')
  }
};

// Helper function to load history
async function loadHistory() {
  try {
    if (existsSync(CONFIG.historyFile)) {
      const data = await fs.readFile(CONFIG.historyFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading history:', error.message);
  }
  return [];
}

// Helper function to save history
async function saveHistory(history) {
  try {
    await fs.writeFile(CONFIG.historyFile, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving history:', error.message);
  }
}

// Scrape latest videos from JW.org
async function scrapeVideos(browser, history) {
  console.log('Scraping latest videos...');
  const page = await browser.newPage();
  const videosList = [];

  try {
    await page.goto('https://www.jw.org/en/library/videos/#en/categories/LatestVideos', {
      waitUntil: 'networkidle2',
      timeout: 100000
    });

    await page.waitForSelector('.contentArea', { timeout: 100000 });

    const videos = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('.synopsis.lss.desc.showImgOverlay.hasDuration.jsLanguageAttributes.dir-ltr.lang-en.ml-E.ms-ROMAN');

      elements.forEach(element => {
        const link = element.querySelector('a');
        const titleElement = element.querySelectorAll('a.jsNoScroll')[1];
        const image = element.querySelector('img');

        if (link && titleElement && image) {
          items.push({
            Link: link.getAttribute('href'),
            Title: titleElement.textContent.trim(),
            Image: image.getAttribute('src')
          });
        }
      });

      return items;
    });

    for (const video of videos) {
      if (!history.includes(video.Link)) {
        videosList.push(video);
        history.push(video.Link);
      }
    }

    console.log(`Found ${videosList.length} new videos`);
  } catch (error) {
    console.error('Error scraping videos:', error.message);
  } finally {
    await page.close();
  }

  return videosList;
}

// Scrape latest books from JW.org
async function scrapeBooks(browser, history) {
  console.log('Scraping latest books...');
  const page = await browser.newPage();
  const booksList = [];
  const picsList = [];

  try {
    await page.goto('https://www.jw.org/en/library/books', {
      waitUntil: 'networkidle2',
      timeout: 100000
    });

    await page.waitForSelector('#pubsViewResults', { timeout: 100000 });

    const books = await page.evaluate(() => {
      const items = [];
      const images = [];

      const bookElements = document.querySelectorAll('.publicationDesc');
      bookElements.forEach(element => {
        const link = element.querySelector('a');
        if (link) {
          items.push({
            Link: 'https://www.jw.org' + link.getAttribute('href'),
            Title: element.textContent.trim()
          });
        }
      });

      const imageElements = document.querySelectorAll('.cvr-wrapper img');
      imageElements.forEach(img => {
        images.push(img.getAttribute('src'));
      });

      return { books: items, images };
    });

    for (let i = 0; i < books.books.length; i++) {
      const book = books.books[i];
      if (!history.includes(book.Link)) {
        booksList.push(book);
        history.push(book.Link);
        if (books.images[i]) {
          picsList.push(books.images[i]);
        }
      }
    }

    console.log(`Found ${booksList.length} new books`);
  } catch (error) {
    console.error('Error scraping books:', error.message);
  } finally {
    await page.close();
  }

  return { booksList, picsList };
}

// Parse RSS feed for news
async function parseNews(history) {
  console.log('Parsing news RSS feed...');
  const parser = new Parser();
  const newsList = [];

  try {
    const feed = await parser.parseURL('https://www.jw.org/en/whats-new/rss/WhatsNewWebArticles/feed.xml');

    for (const entry of feed.items) {
      const newsItem = {
        Link: entry.link,
        Title: entry.title,
        Image: ''
      };

      // Try to extract image from summary
      try {
        if (entry.summary) {
          const imgMatch = entry.summary.match(/src="([^"]+)"/);
          if (imgMatch && imgMatch[1]) {
            newsItem.Image = imgMatch[1];
          }
        }
      } catch (error) {
        console.error('Error extracting image from news item:', error.message);
      }

      if (!history.includes(newsItem.Link)) {
        newsList.push(newsItem);
        history.push(newsItem.Link);
      }
    }

    console.log(`Found ${newsList.length} new news items`);
  } catch (error) {
    console.error('Error parsing news feed:', error.message);
  }

  return newsList;
}

// Get daily Bible reading
async function getDailyReading() {
  try {
    const bibleContent = await fs.readFile(CONFIG.bibleFile, 'utf-8');
    const daysContent = await fs.readFile(CONFIG.daysFile, 'utf-8');

    const bibleLines = bibleContent.split('\n');
    const daysLines = daysContent.split('\n');

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const sliceOfYear = dayOfYear - 1;
    const dayList = bibleLines[sliceOfYear] || '';
    const scriptList = daysLines[sliceOfYear] || '';

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const today = now.toLocaleDateString('en-US', options);

    return { dayList, scriptList, dayOfYear, today };
  } catch (error) {
    console.error('Error getting daily reading:', error.message);
    return { dayList: '', scriptList: '', dayOfYear: 0, today: '' };
  }
}

// Generate HTML email content
async function generateEmailHTML(videosList, newsList, booksList, picsList) {
  const readingData = await getDailyReading();

  // Load templates
  const mainHTML = await fs.readFile(CONFIG.templates.main, 'utf-8');
  const readingTemplate = await fs.readFile(CONFIG.templates.reading, 'utf-8');
  const videoTemplate = await fs.readFile(CONFIG.templates.video, 'utf-8');
  const newsTemplate = await fs.readFile(CONFIG.templates.news, 'utf-8');
  const booksTemplate = await fs.readFile(CONFIG.templates.books, 'utf-8');
  const endHTML = await fs.readFile(CONFIG.templates.end, 'utf-8');

  let videos = '';
  let news = '';
  let books = '';

  // Generate reading section
  const reading = "<tr><td class='content'><h1>Read the Bible Daily</h1>" +
    readingTemplate
      .replace('{Script:}', readingData.scriptList)
      .replace('{Script:}', readingData.scriptList)
      .replace('{Day:}', readingData.dayList)
      .replace('{YearDay:}', readingData.dayOfYear)
      .replace('{Today:}', readingData.today) +
    "</td></tr>";

  // Generate videos section
  if (videosList.length > 0) {
    videos = "<tr><td class='content'><h1>Latest Videos</h1>";
    for (const video of videosList) {
      videos += videoTemplate
        .replace('{Text1:}', video.Title)
        .replace('{Link1:}', video.Link)
        .replace('{Link1:}', video.Link)
        .replace('{Img1:}', video.Image);
    }
    videos += "</td></tr>";
  }

  // Generate news section
  if (newsList.length > 0) {
    news = "<tr><td class='content'><h1>Latest News</h1>";
    for (const newsItem of newsList) {
      news += newsTemplate
        .replace('{Text2:}', newsItem.Title)
        .replace('{Link2:}', newsItem.Link)
        .replace('{Link2:}', newsItem.Link)
        .replace('{Img2:}', newsItem.Image);
    }
    news += "</td></tr>";
  }

  // Generate books section
  if (booksList.length > 0) {
    books = "<tr><td class='content'><h1>Latest Books</h1>";
    for (let i = 0; i < booksList.length; i++) {
      const book = booksList[i];
      const pic = picsList[i] || '';
      books += booksTemplate
        .replace('{Text3:}', book.Title)
        .replace('{Link3:}', book.Link)
        .replace('{Link3:}', book.Link)
        .replace('{Img3:}', pic);
    }
    books += "</td></tr>";
  }

  return mainHTML + reading + videos + news + books + endHTML;
}

// Load email list
async function loadEmailList() {
  try {
    if (existsSync(CONFIG.emailListFile)) {
      const content = await fs.readFile(CONFIG.emailListFile, 'utf-8');
      return content.split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }
  } catch (error) {
    console.error('Error loading email list:', error.message);
  }
  return [];
}

// Send email
async function sendEmail(htmlContent, emailList) {
  console.log('Sending email...');

  const transporter = nodemailer.createTransport({
    host: CONFIG.smtpHost,
    port: CONFIG.smtpPort,
    secure: false,
    auth: {
      user: CONFIG.smtpUser,
      pass: CONFIG.smtpPass
    }
  });

  const recipients = [CONFIG.toEmail, ...emailList];

  const mailOptions = {
    from: CONFIG.fromEmail,
    to: CONFIG.toEmail,
    bcc: emailList,
    subject: 'JW.ORG Update',
    text: 'HTML only. Please enable HTML email.',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting JW News Parser...');
  console.log('Timestamp:', new Date().toISOString());

  let browser;

  try {
    // Load history
    let history = await loadHistory();

    // Launch browser
    browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Scrape content
    const videosList = await scrapeVideos(browser, history);
    const { booksList, picsList } = await scrapeBooks(browser, history);
    const newsList = await parseNews(history);

    // Save updated history
    await saveHistory(history);

    // Generate email HTML
    const htmlContent = await generateEmailHTML(videosList, newsList, booksList, picsList);

    // Load email list and send email
    const emailList = await loadEmailList();

    // Always send email (includes daily reading even if no new content)
    await sendEmail(htmlContent, emailList);

    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the application
main();
