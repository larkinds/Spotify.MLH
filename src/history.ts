import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import Track from './track';

export class HistoryProvider implements vscode.TreeDataProvider<Track> {
    private _onDidChangeTreeData: vscode.EventEmitter<Track | undefined | null | void> = new vscode.EventEmitter<Track | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Track | undefined | null | void> = this._onDidChangeTreeData.event;
    private after?: number = undefined;
    public tracks: Track[] = [];
    
    constructor(private spotify: SpotifyWebApi) {}

    getChildren(element?: Track): Thenable<Track[]> {
        if (element) {
            // Tracks do not have children
            return Promise.resolve([]);
        }

        if (this.tracks.length === 0) {
            this.loadNewTracks();
        }

        return Promise.resolve(this.tracks);
    }

    getTreeItem(element: Track): vscode.TreeItem {
		return element;
	}

    loadNewTracks() {
        return Promise.resolve(this.spotify.getMyRecentlyPlayedTracks({ after: this.after, limit: 50 }).then(
            data => {
                if (data.body.items.length === 0) {
                    vscode.window.showInformationMessage("Spotify didn't return any newer tracks.");
                    return; // Skip to the next promise in the chain
                }
                this.after = Number(data.body.cursors.after);
                this.tracks = data.body.items.map((x: any) => new Track(x.track)).concat(this.tracks);
                this._onDidChangeTreeData.fire(); // Tell VS Code that the TreeItems have changed
            },
            error => vscode.window.showErrorMessage(error)
        ));
    }
}
