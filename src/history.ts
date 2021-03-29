import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import Track from './track';

/**
 * TreeDataProvider for playback history
 * @extends vscode.TreeDataProvider
 * @param {SpotifyWebApi} spotify - Spotify API object to make calls with
 * @param {vscode.ExtensionContext} context - Extension context to register commands in
 */
export class HistoryProvider implements vscode.TreeDataProvider<Track> {
    private _onDidChangeTreeData: vscode.EventEmitter<Track | undefined | null | void> = new vscode.EventEmitter<Track | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Track | undefined | null | void> = this._onDidChangeTreeData.event;
    private after?: number = undefined;
    private before?: number = undefined;
    public tracks: Track[] = [];
    
    constructor(private spotify: SpotifyWebApi, private readonly context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.history.newer", () => {
            this.spotify.getMyRecentlyPlayedTracks({ after: this.after, limit: 50 }).then(
                data => {
                    if (data.body.items.length === 0) {
                        vscode.window.showInformationMessage("Spotify didn't return any newer history.");
                        return;
                    }
                    this.after = Number(data.body.cursors.after);
                    if (!this.before) {
                        // Only update with initial population of the TreeView
                        // Updates will be handled by spotifymlh.history.older
                        this.before = Number(data.body.cursors.before);
                    }
                    this.tracks = data.body.items.map((x: any) => new Track(x.track)).concat(this.tracks);
                    this._onDidChangeTreeData.fire(); // Tell VS Code that the TreeItems have changed
                },
                error => vscode.window.showErrorMessage(error.message)
            );
        }));
        context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.history.older", () => {
            this.spotify.getMyRecentlyPlayedTracks({ before: this.before, limit: 50 }).then(
                data => {
                    if (data.body.items.length === 0) {
                        vscode.window.showInformationMessage("Spotify didn't return any older history.");
                        return;
                    }
                    this.before = Number(data.body.cursors.before);
                    this.tracks.push(...data.body.items.map((x: any) => new Track(x.track)));
                    this._onDidChangeTreeData.fire(); // Tell VS Code that the TreeItems have changed
                },
                error => vscode.window.showErrorMessage(error.message)
            );
        }));
    }

    getChildren(element?: Track): Thenable<Track[]> {
        if (element) {
            // Tracks do not have children
            return Promise.resolve([]);
        }

        if (this.tracks.length === 0) {
            vscode.commands.executeCommand("spotifymlh.history.newer");
        }

        return Promise.resolve(this.tracks.concat([new LoadMoreTracks]));
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
            error => vscode.window.showErrorMessage(error.message)
        ));
    }
}

/**
 * A placeholder Track that loads more history when clicked
 * @extends Track
 */
class LoadMoreTracks extends Track {
    constructor() {
        super({
            name: "Load more...",
            artists: [],
            uri: undefined
        });
        this.command = {
            command: "spotifymlh.history.older",
            title: "Load older play history"
        };
        this.contextValue = undefined; // Don't show track actions
        this.tooltip = "Load older play history";
    }
}
