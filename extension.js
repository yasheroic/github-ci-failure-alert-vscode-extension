const vscode = require('vscode');
const fetch = require('node-fetch');
const path = require('path');
const { exec } = require("child_process");

const OWNER = "yasheroic";
const REPO = "github-ci-failure-alert-vscode-extension";

const API = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs`;

let lastFailure = null;

function activate(context) {

    console.log("GitHub CI Alert extension started");

    vscode.window.showInformationMessage("GitHub CI Alert extension started");

    playSound();

    // run once immediately
    checkCI();

    // check every 10 seconds (better for demo)
    setInterval(checkCI, 10000);
}

async function checkCI() {

    try {

        console.log("Checking GitHub Actions...");

        const res = await fetch(API);
        const data = await res.json();

        if (!data.workflow_runs || data.workflow_runs.length === 0) {
            console.log("No workflow runs found");
            return;
        }

        const run = data.workflow_runs[0];

        console.log("Latest run:", run.id, run.conclusion);

        // first run initialization
        if (!lastFailure) {
            lastFailure = run.id;
            console.log("Initialized last run:", run.id);
            return;
        }

        // detect new failure
        if (run.conclusion === "failure" && run.id !== lastFailure) {

            console.log("New CI failure detected");

            lastFailure = run.id;

            vscode.window.showErrorMessage(`CI Failed: ${run.name}`);

            playSound();
        }

    } catch (err) {

        console.error("CI check error:", err);

    }

}

function playSound() {

    const soundPath = path.join(__dirname, "sounds", "fail.mp3");

    console.log("Playing sound:", soundPath);

    exec(`afplay "${soundPath}"`, (err) => {
        if (err) {
            console.error("Sound error:", err);
        } else {
            console.log("Sound played successfully");
        }
    });

}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};