const axios = require('axios');
var textdb;
var secret = null;
async function indexOfIssueGH(title) {
    const res = await axios.get(textdb.strings.issueGH);
    const issues = res.data;
    const t = title.substring(0, 50);
    for (var i = 0; i < issues.length; i++) {
        console.log(issues[i].title, t);
        if (issues[i].title.indexOf(t) > -1) {
            return true;
        }
    }
    return false;
}
async function createIssueGH(title, body) {
    if(!secret){
        return;
    }
    if (!secret.githubtoken) {
        return;
    }
    const isRepeat = await indexOfIssueGH(title);
    if (isRepeat) {
        return;
    }
    const issue = {
        "title": title,
        "body": body,
        "labels": [
            "bug",
            "simabot"
        ],
        "assignees": [
            "goosesima"
        ]
    };
    const headers = {
        'Authorization': 'token ' + secret.githubtoken,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
    };
    try {
        const res = await axios.post(textdb.strings.issueGH, issue, { headers: headers });
    } catch (error) {
        console.log('While creating issue: ');
        console.log(error.response);
    }
}

var issues = [];

function newIssue(title, body) {
    issues.push([title, body]);
}

setInterval(async function () {
    for (let i = 0; i < issues.length; i++) {
        const e = issues[i];
        await createIssueGH(e[0], e[1]);
    }
    issues = [];
}, 1000);

exports.newIssue = newIssue;
exports.setSecret = function (s) {
    secret = s;
}
exports.init = function (data) {
    textdb = data.textdb;
}