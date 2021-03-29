import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import Track from './track';

/**
 * TreeDataProvider for liked tracks
 * @extends vscode.TreeDataProvider
 * @param {SpotifyWebApi} spotify - Spotify API object to make calls with
 * @param {vscode.ExtensionContext} context - Extension context to register commands in
 */
export class LikesProvider implements vscode.TreeDataProvider<Track> {
    private _onDidChangeTreeData: vscode.EventEmitter<Track | undefined | null | void> = new vscode.EventEmitter<Track | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Track | undefined | null | void> = this._onDidChangeTreeData.event;
    private offset = 0;
    private tracks: Track[] = [];

    constructor(private spotify: SpotifyWebApi, private readonly context: vscode.ExtensionContext) {
        // TODO: Don't assume new likes never arrive

        // Command run by refresh button
        context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.likes.refresh", () => {
            this.offset = 0;
            this.tracks = [];
            this.loadNewTracks();
        }));

        // Command run by "Load more..." button
        context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.likes.older", () => {
            this.loadNewTracks();
        }));
    }

    getChildren(element?: Track): vscode.ProviderResult<Track[]> {
        if (element) {
            // Tracks do not have children
            return Promise.resolve([]);
        }

        if (this.tracks.length === 0) {
            this.loadNewTracks();
        }

        return Promise.resolve(this.tracks.concat([new LoadMoreLikes]));
    }

    getTreeItem(element: Track): vscode.TreeItem {
        return element;
    }

    /**
     * Loads more liked tracks into the provider and advertises a contents change
     */
    loadNewTracks(): void {
        this.spotify.getMySavedTracks({ offset: this.offset, limit: 50 }).then(
            data => {
                if (data.body.items.length === 0) {
                    vscode.window.showInformationMessage("Spotify didn't return any more liked tracks.");
                    return;
                }
                this.offset = data.body.offset + data.body.limit; // Trust the API more than the object
                this.tracks.push(...data.body.items.map((x: SpotifyApi.SavedTrackObject) => new Track(x.track)));
                this._onDidChangeTreeData.fire(); // Tell VS Code that the TreeItems have changed
            },
            error => vscode.window.showErrorMessage(error.message)
        );
    }
}

/**
 * A placeholder Track that loads more likes when clicked
 * @extends Track
 */
class LoadMoreLikes extends Track {
    constructor() {
        super({
            name: "Load more...",
            artists: [],
            uri: undefined
        });
        this.command = {
            command: "spotifymlh.likes.older",
            title: "Load more liked tracks"
        };
        this.contextValue = undefined; // Don't show track actions
        this.tooltip = "Load more liked tracks";
    }
}
