const fs = require('fs');
const axios = require('axios');
require("dotenv").config();

async function getMostRecentRepo(user) {
    const url = `https://api.github.com/users/${user}/events/public`;
    return await axios.get(url)
        .then(response => {
            const mostRecentPushEvent = response.data.find(event => event.type === 'PushEvent');
            if (!mostRecentPushEvent) {
                console.log('No push events found.');
                return;
            }
            const repoName = mostRecentPushEvent.repo.name;
            return {
                repo: repoName.split('/')[1],
                url: `https://github.com/${repoName}`
            };
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

async function main() {
    const data = await getMostRecentRepo(process.env.USER);

    const prevRepoName = fs.readFileSync("prev-repo-name.txt", "utf8").trim();
    if (prevRepoName == data.repo) {
        console.log(`Most recently updated repo is still ${data.repo}`);
        return;
    }

    console.log(`Updating current repo name to ${data.repo}...`);
    fs.writeFileSync('current-repo-name.txt', data.repo);

    console.log("Reading README.md...");
    const content = fs.readFileSync("README.md", 'utf8');

    console.log("Updating README.md...");
    const re = /\[\!\[Most recently updated repo\]\(.*/;
    const replacementString = `[![Most recently updated repo](https://github-readme-stats.vercel.app/api/pin/?theme=transparent&username=mecaneer23&repo=${data.repo})](${data.url})`;
    const formatted = content.replace(re, replacementString);

    fs.writeFileSync("README.md", formatted, 'utf8');
}

main();
