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

function getLangColor(lang) {
    return JSON.parse(fs.readFileSync('github-colors.json', 'utf8'))[lang] || "gray";
}

async function generateSvg() {
    const data = await getMostRecentRepo(process.env.USER);
    const width = Math.max(data.desc.length * 7, 300);

    const svgContent = `\
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="109"
    version="1.2" baseProfile="tiny" data-reactroot="">
    <defs />
    <g fill="none" stroke="black" stroke-width="1" fill-rule="evenodd" stroke-linecap="square" stroke-linejoin="bevel">
        <g fill="white" fill-opacity="1" stroke="none" transform="matrix(1,0,0,1,0,0)">
            <rect x="0" y="0" width="${width}" height="109" rx="6" ry="6" />
        </g>
        <g fill="#586069" fill-opacity="1" stroke="none" transform="matrix(1.25,0,0,1.25,17,21)">
            <path vector-effect="none" fill-rule="evenodd"
                d="M4,9 L3,9 L3,8 L4,8 L4,9 M4,6 L3,6 L3,7 L4,7 L4,6 M4,4 L3,4 L3,5 L4,5 L4,4 M4,2 L3,2 L3,3 L4,3 L4,2 M12,1 L12,13 C12,13.55 11.55,14 11,14 L6,14 L6,16 L4.5,14.5 L3,16 L3,14 L1,14 C0.45,14 0,13.55 0,13 L0,1 C0,0.45 0.45,0 1,0 L11,0 C11.55,0 12,0.45 12,1 M11,11 L1,11 L1,13 L3,13 L3,12 L6,12 L6,13 L11,13 L11,11 M11,1 L2,1 L2,10 L11,10 L11,1" />
        </g>
        <g fill="#0366d6" fill-opacity="1" stroke="#0366d6" stroke-opacity="1" stroke-width="1" stroke-linecap="square"
            stroke-linejoin="bevel" transform="matrix(1,0,0,1,0,0)"><a class="link" href="${data.url}">
                <text class="title" fill="#0366d6" fill-opacity="1" stroke="none"
                    xml:space="preserve" x="41" y="33" font-family="sans-serif" font-size="16" font-weight="630"
                    font-style="normal">${data.repo}</text></a></g>
        <g fill="#586069" fill-opacity="1" stroke="#586069" stroke-opacity="1" stroke-width="1" stroke-linecap="square"
            stroke-linejoin="bevel" transform="matrix(1,0,0,1,0,0)"><text class="desc" fill="#586069" fill-opacity="1" stroke="none"
                xml:space="preserve" x="17" y="65" font-family="sans-serif" font-size="14" font-weight="400"
                font-style="normal">${data.desc}</text></g>
        <g fill="#24292e" fill-opacity="1" stroke="#24292e" stroke-opacity="1" stroke-width="1" stroke-linecap="square"
            stroke-linejoin="bevel" transform="matrix(1,0,0,1,0,0)"><text class="lang" fill="#24292e" fill-opacity="1" stroke="none"
                xml:space="preserve" x="33" y="91" font-family="sans-serif" font-size="12" font-weight="400"
                font-style="normal">${data.lang}</text></g>
        <circle class="lang-color" cx="23" cy="86" r="7" stroke="none" fill="${getLangColor(data.lang)}" />
    </g>
</svg>`;

    fs.writeFileSync('recent-commit.svg', svgContent);
    fs.writeFileSync('current-file-name.txt', data.repo);

    const content = fs.readFileSync("README.md", 'utf8');

    const re = /\[\!\[Most recently updated repo\]\(recent-commit\.svg.*/;
    const replacementString = `[![Most recently updated repo](recent-commit.svg)](${data.url})`;
    const formatted = content.replace(re, replacementString);

    fs.writeFileSync("README.md", formatted, 'utf8');

}

generateSvg();
