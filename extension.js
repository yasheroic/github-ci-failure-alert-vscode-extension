const vscode = require('vscode');
const fetch = require('node-fetch');
const path = require('path');

const OWNER = "yasheroic";
const REPO = "github-ci-failure-alert-vscode-extension";

const API = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs`;

let lastFailure = null;

function activate(context) {

    vscode.window.showInformationMessage("GitHub CI Alert extension started");

    checkCI();

    setInterval(checkCI, 60000);
}

async function checkCI() {

    try {

        const res = await fetch(API);
        const data = await res.json();

        const run = data.workflow_runs[0];

        if(!run) return;

        if(!lastFailure){
            lastFailure = run.id;
            return;
        }

        if(run.conclusion === "failure" && run.id !== lastFailure){

            lastFailure = run.id;

            vscode.window.showErrorMessage(`CI Failed: ${run.name}`);

            playSound();
        }

    } catch(err){

        console.log("CI check error:", err);

    }

}

function playSound(){

    const player = require('play-sound')();
    const soundPath = path.join(__dirname, 'sounds', 'fail.mp3');

    player.play(soundPath, function(err){
        if(err) console.log(err);
    });

}

function deactivate(){}

module.exports = {
    activate,
    deactivate
};