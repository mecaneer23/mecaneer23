const fs = require('fs');
const axios = require('axios');
require("dotenv").config();

async function getMostRecentRepo(user) {
    const url = `https://api.github.com/users/${user}/events/public`;
    return await axios.get(url)
        .then(response => {
            const mostRecentEvent = response.data.find(event => (event.type === "PushEvent" || event.type === "CreateEvent"));
            if (!mostRecentEvent) {
                console.log('No recent events found of correct type. Logging most recent event...');
                console.log(response.data[0]);
                return;
            }
            const repoName = mostRecentEvent.repo.name;
            const [name, repo] = repoName.split('/');
            return {
                name: name,
                repo: repo,
                url: `https://github.com/${repoName}`
            };
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

function nonoverlappingPairs(arr, func) {
    for (var i = 0; i < arr.length - 1; i += 2) {
        func(arr[i], arr[i + 1] || null)
    }
}

function format_repo(repoName) {
    return `[![${repoName}](https://github-readme-stats-mecaneer23.vercel.app/api/pin/?theme=transparent&username=mecaneer23&repo=${repoName})](https://github.com/mecaneer23/${repoName})`;
}

function format_repositories(repositories) {
    let formatted = new Array();
    formatted.push("### Pinned repositories");
    formatted.push("");
    nonoverlappingPairs(repositories, (left, right) => {
        if (!right) {
            formatted.push(`| ${format_repo(left)} | |`);
            return;
        }
        formatted.push(`| ${format_repo(left)} | ${format_repo(right)} |`);
    });
    const tableInformerOffset = 3;
    formatted = [...formatted.slice(0, tableInformerOffset), "| - | - |", ...formatted.slice(tableInformerOffset)];
    formatted.push("");
    return formatted.join("\n");
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
    const replacementString = `[![Most recently updated repo](https://github-readme-stats-mecaneer23.vercel.app/api/pin/?theme=transparent&username=${data.name}&repo=${data.repo})](${data.url})`;
    const newRepoFormatted = content.replace(re, replacementString);

    const formatted = newRepoFormatted
        .replace(/<div title=".*">/, `<div title="Link updated at ${(new Date()).toString()}">`)
        .replace(/### Pinned repositories[.\s\S]+$(?![\r\n])/, format_repositories(
            [
                "BinarytoDecimal",
                "Ndo",
                "mecaneer23.github.io",
                "python-snake-game",
                "sl",
                "pages",
                ".bashrc",
                "qr-code",
                "local-file-server",
                "clock",
                "logic-puzzles",
                "FtcRobotController",
            ]
        ));

    fs.writeFileSync("README.md", formatted, 'utf8');
}

main();
