import * as vscode from 'vscode';

/**
 * A single track on Spotify.
 * @extends vscode.TreeItem
 * @param {any} track - Track object returned from Spotify (likely in `data.body.items[]`)
 */
export default class Track extends vscode.TreeItem {
    artists: any[];
    name: string;
    uri: string;
    
    constructor(
        public readonly data: any
    ) {
        super(data.name);
        this.contextValue = 'track';
        this.name = data.name;
        this.artists = data.artists;
        this.uri = data.uri;

        this.description = this.artists.map(x => x.name).join(', ');
        this.tooltip = new vscode.MarkdownString(`**${this.name}**  \n${this.artists.map(x => x.name).join(', ')}`);
    }
}