const fs = require('fs');
const axios = require('axios');
require("dotenv").config();

async function getRepoInfo(user, repo) {
    const url = `https://api.github.com/repos/${user}/${repo}`
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.length === 0) {
            return [{ name: "repo_fetch_failed" }];
        }
        return {
            repo: data.name,
            url: data.html_url,
            desc: data.description,
            lang: data.language
        };
    } catch (error) {
        console.error("Error fetching repository data:", error);
        return [{ name: "repo_fetch_failed" }];
    }
}

async function getMostRecentRepo(user) {
    const url = `https://api.github.com/users/${user}/events/public`;
    return await axios.get(url)
        .then(response => {
            const mostRecentPushEvent = response.data.find(event => event.type === 'PushEvent');
            if (!mostRecentPushEvent) {
                console.log('No push events found.');
                return;
            }
            return getRepoInfo(user, mostRecentPushEvent.repo.name.split('/')[1]);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

async function main() {
    const data = await getMostRecentRepo(process.env.USER);

    const prevRepoName = fs.readFileSync("prev-file-name.txt", "utf8").trim();
    if (prevRepoName == data.repo) {
        console.log(`Most recently updated repo is still ${data.repo}`);
        return;
    }

    console.log(`Updating current repo name to ${data.repo}...`);
    fs.writeFileSync('current-file-name.txt', data.repo);

    console.log("Reading README.md...");
    const content = fs.readFileSync("README.md", 'utf8');

    console.log("Updating README.md...");
    const re = /\[\!\[Most recently updated repo\]\(.*/;
    const replacementString = `[![Most recently updated repo](https://github-readme-stats.vercel.app/api/pin/?theme=transparent&username=mecaneer23&repo=${data.repo})](${data.url})`;
    const formatted = content.replace(re, replacementString);

    fs.writeFileSync("README.md", formatted, 'utf8');
}

main();
