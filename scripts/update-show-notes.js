/* Usage:
*  node <path to script>
*  node <path to script> <episode number>
*/

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
  const mdFile = `show-notes/${episodeId.padStart(3, '0')} - ${episodeInfo.info.title}.md`;
  mediumToMarkdown(mediumLink)
  .then(result => fs.writeFileSync(mdFile, result));

  console.log(`File written to ${mdFile}.`);
})
