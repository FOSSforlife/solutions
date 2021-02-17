const Podcast = require('podcast');
const feedOptions = require('../feed-info');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const episodes = [];
for (const file of fs.readdirSync(path.join(__dirname, '..', 'episodes'))) {
  episodes.push(
    yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'episodes', file)))
  );
}
const feed = new Podcast(feedOptions);

const calcLength = ({ hours = 0, mins, secs }) => {
  return hours * 3600 + mins * 60 + secs;
};

episodes.forEach((ep) => {
  feed.addItem({
    title: ep.info.title,
    description: ep.info.description,
    url:
      ep.metadata.totalEpisodeNo === 1
        ? 'https://instagram.com/solnspodcast'
        : ep.links.medium,
    enclosure: {
      url: ep.links.mp3,
      type: 'audio/mpeg',
    },
    date: ep.metadata.dateReleased,
    itunesDuration: calcLength(ep.metadata.length),
    itunesImage: ep.metadata.img,
    itunesSummary: ep.info.description,
  });
});

const xml = feed.buildXml('\t');

if (!fs.existsSync(path.join(__dirname, 'rss'))) {
  fs.mkdirSync(path.join(__dirname, 'rss'));
}
fs.writeFileSync(path.join(__dirname, 'rss', 'feed.xml'), xml);
