import * as vscode from 'vscode';

export class RecentProvider implements vscode.TreeDataProvider<Track> {
    constructor(private spotify: any) {}

    getChildren(element?: Track): Thenable<Track[]> {
        // TODO: implement
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.spotify.getMyRecentlyPlayedTracks({limit: 50}).then(
            (data: any) => {
                console.log(data.body.items);
                return Promise.resolve(data.body.items.map((x: any) => new Track(x.track.artists, x.track.name)));
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

export class Track extends vscode.TreeItem {
    constructor(
        public readonly artists: any[],
        public readonly name: string
    ) {
        super(name);
        this.description = artists.map(x => x.name).join(', ');
        this.tooltip = new vscode.MarkdownString(`**${name}**  \n${artists.map(x => x.name).join(', ')}`);
    }
}
