import * as vscode from "vscode";

const data = {
    previousItem: {
        command: "spotifymlh.previous",
        text: "$(triangle-left)"
    },
    pauseItem: {
        command: "spotifymlh.pause",
        text: "$(debug-pause)",
    },
    playItem: {
        command: "spotifymlh.play",
        text: "$(debug-start)",
    },
    nextItem: {
        command: "spotifymlh.next",
        text: "$(triangle-right)"
    }
};


export function renderStatusBar(context: any) {
    for (const [key, value] of Object.entries(data)) {
    
        let temp = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        temp.command = value.command;
        
        context.subscriptions.push(temp);
    
        temp.text = value.text;
        
        temp.show();
    }
}
