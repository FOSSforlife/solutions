const Podcast = require('podcast');
const feedOptions = require('./src/assets/data/feedOptions');
const episodes = require('./src/assets/data/episodes.json');
const fs = require('fs');
const path = require('path');

const feed = new Podcast(feedOptions);

episodes.forEach((ep) => {
  feed.addItem({
    title: ep.info.title,
    description: ep.info.description,
    url: ep.links.medium,
    enclosure: {
      url: ep.links.mp3,
      type: 'audio/mpeg',
    },
    date: ep.metadata.dateReleased,
    // itunesDuration: ???,
    itunesImage: ep.metadata.img,
  });
});

const xml = feed.buildXml('\t');
fs.writeFileSync(path.join(__dirname, 'xml', 'feed.xml'), xml);
