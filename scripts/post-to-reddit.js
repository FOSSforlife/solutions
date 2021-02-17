/* Usage:
*  node <path to script>
*  node <path to script> <episode number>
*/

const fs = require('fs');
const yaml = require('js-yaml');
const snoowrap = require('snoowrap');

const FLAIR_ID = '234698b0-6c1c-11eb-afed-0e8677fcfabb';

// use latest episode if no episode number given
const latestEpisodeId = fs.readdirSync('./episodes').pop().substr(2, 3);
const episodeId = process.argv[2] || latestEpisodeId;
const mdFile = 'show-notes/' +
  fs.readdirSync('./show-notes').find(f => f.startsWith(episodeId).padStart(3, '0'));

fs.readFile(mdFile, async (err, mdText) => {
  if (err) {
    console.error(`Show notes for episode ${episodeId} not found.`);
    process.exit(1);
  }

  const r = new snoowrap({
    userAgent: '/r/SolutionsPodcast GitHub Action',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: 'SolutionsBot',
    password: process.env.REDDIT_PASSWORD,
  });

  const subreddit = await r.getSubreddit('solutionspodcast');

  // See if post already exists
  const searchResults = await subreddit.search({
    query: `Episode ${Number(episodeId)} flair:"Episode Discussion"`,

  });
  for(let post of searchResults) {
    if (post.title().startsWith(`Episode ${episodeId}`)) {
      await post.edit(mdText);
      console.log(`Post updated: ${(await post).url}`);
      return;
    }
  }

  const episodeInfo = yaml.safeLoad(fs.readFileSync(`episodes/ep${episodeId.padStart(3, '0')}.yml`));
  const selfPost = await subreddit.submitSelfpost({
    title: `Episode ${episodeId}: ${episodeInfo.info.title}`,
    text: mdText
  }).sticky().selectFlair({flair_template_id: FLAIR_ID});

  console.log(`Post submitted: ${selfPost.url}`);
  episodeInfo.links.reddit = selfPost.url;
  fs.writeFileSync(`episodes/ep${episodeId.padStart(3, '0')}.yml`, yaml.dump(episodeInfo));
});
