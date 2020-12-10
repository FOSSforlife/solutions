const Podcast = require('podcast');
const feedOptions = require('./feed-info');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


const episodes = [];
for(const file of fs.readdirSync('./episodes')) {
  episodes.push(yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'episodes', file))));
}
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

if(!fs.existsSync(path.join(__dirname, 'xml'))) {
  fs.mkdirSync(path.join(__dirname, 'xml'));
}
fs.writeFileSync(path.join(__dirname, 'xml', 'feed.xml'), xml);
