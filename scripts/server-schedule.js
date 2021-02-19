const fs = require('fs');
const schedule = require('node-schedule');
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();
const dotenv = require('dotenv');
dotenv.config();

const jobs = [
  schedule.scheduleJob('*/30 * * * *', async function () {
    const MEDIUM_LINK = 'https://medium.com/feed/solutions';
    const WEBHOOK_URL =
      'https://api.github.com/repos/FOSSforlife/solutions/dispatches';
    const SOLUTIONS_FEED_FILE = 'data/solns-medium.json';

    console.log('Fetching Medium RSS');
    const feed = await parser.parseURL(MEDIUM_LINK);
    const cachedFeed = fs.readFileSync(SOLUTIONS_FEED_FILE, { flag: 'a+' });

    if (JSON.stringify(feed) !== JSON.stringify(JSON.parse(cachedFeed))) {
      console.log('Content has changed. Triggering webhook');
      await axios.post(
        WEBHOOK_URL,
        {
          event_type: 'fetch-show-notes',
        },
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${process.env.GITHUB_REPOSITORY_DISPATCH_TOKEN}`,
            'Content-Type': 'application/javascript',
          },
        }
      );
      fs.writeFileSync(SOLUTIONS_FEED_FILE, JSON.stringify(feed));
    }
  }),
];
