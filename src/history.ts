import * as vscode from 'vscode';
import Track from './track';

export class HistoryProvider implements vscode.TreeDataProvider<Track> {
    constructor(private spotify: any) {}

    getChildren(element?: Track): Thenable<Track[]> {
        // TODO: implement
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.spotify.getMyRecentlyPlayedTracks({limit: 50}).then(
            (data: any) => {
                return Promise.resolve(data.body.items.map((x: any) => new Track(x.track)));
            },
            (error: any) => {
                vscode.window.showErrorMessage(error);
            }
        ));
    }

    getTreeItem(element: Track): vscode.TreeItem {
		return element;
	}
}
