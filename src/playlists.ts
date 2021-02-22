import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');
import Track from './track';

//turn name into dropdown that displays tracks - register a command with an action?

export class PlaylistsProvider implements vscode.TreeDataProvider<Playlist> {
  
  constructor(private spotify: SpotifyWebApi) {}

  async getChildren(element?: Playlist): Promise<Playlist[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const user = await this.spotify.getMe();
    try {
      const playlists = await this.spotify.getUserPlaylists(user.id);
      return playlists.body.items.map((playlist: any) => new Playlist(playlist, this.spotify, vscode.TreeItemCollapsibleState.Collapsed));
    } catch (err: any) {
      vscode.window.showErrorMessage(err);
      return [];
    }
  }

  getTreeItem(element: Playlist): vscode.TreeItem {
    return element;
  }
}


export class Playlist extends vscode.TreeItem {
  name: string;
  id: string;
  tracks: Promise <Track[]>;
  state: vscode.TreeItemCollapsibleState;

  constructor (public readonly data: any, private spotify: SpotifyWebApi, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(data.name, collapsibleState);
    this.contextValue = 'playlist';
    this.name = data.name;
    this.id = data.id;
    this.tracks = this.getPlaylistTracks(data.id, spotify);
    this.state = collapsibleState;

    this.description = data.name;
  }
  
  async getPlaylistTracks(id: string, spotify: SpotifyWebApi) {
    let tracksObj = await spotify.getPlaylistTracks(id);
    return tracksObj.body.items.map((data: any) => new Track(data));
  }
}