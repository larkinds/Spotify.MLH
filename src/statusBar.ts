import * as vscode from "vscode";

let pauseItem: vscode.StatusBarItem;
let playItem: vscode.StatusBarItem;
const pauseCommand = "spotifymlh.pause";
const playCommand = "spotifymlh.play";

const data = {
    pauseItem: {
        command: "spotifymlh.pause",
        text: "$(debug-pause)",
    },
    playItem: {
        command: "spotifymlh.play",
        text: "$(debug-start)",
    },
};


export function init(context){
    for (const [key, value] of Object.entries(data)) {
    
        let temp = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        temp.command = value.command;
        
        context.subscriptions.push(temp);
    
        temp.text = value.text;
        temp.show()
    }
}
