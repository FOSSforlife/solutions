/* Usage:
 *  node <path to script>
 *  node <path to script> <episode number>
 */

// TODO: get latest from rss
// TODO: update yaml with medium link
// TODO: merge reddit script into this

const fs = require('fs');
const yaml = require('js-yaml');
const mediumToMarkdown = require('./lib/mediumToMarkdown');

// use latest episode if no episode number given
const latestEpisodeId = fs.readdirSync('./episodes').pop().substr(2, 3);
const episodeId = process.argv[2] || latestEpisodeId;
const ymlFile = `episodes/ep${episodeId.padStart(3, '0')}.yml`;

fs.readFile(ymlFile, (err, data) => {
  if (err) {
    console.error(`Episode ${episodeId} not found.`);
    process.exit(1);
  }
  const episodeInfo = yaml.safeLoad(data);

  const mediumLink = episodeInfo.links.medium;
  const mdFile = `show-notes/${episodeId.padStart(3, '0')} - ${
    episodeInfo.info.title
  }.md`;
  mediumToMarkdown(mediumLink).then((result) =>
    fs.writeFileSync(mdFile, result)
  );

  console.log(`File written to ${mdFile}.`);

  // Update yaml
  episodeInfo.links.github = `https://github.com/FOSSforlife/solutions/blob/main/show-notes/${mdFile}`;
  fs.writeFileSync(ymlFile, yaml.dump(episodeInfo));
});
