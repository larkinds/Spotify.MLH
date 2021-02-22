import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');
import Track from './track';


export class PlaylistsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  playlists: Playlist [] = [];
  constructor(private spotify: SpotifyWebApi) {
    try {
     Promise.resolve(this.spotify.getMe())
    .then((user) => Promise.resolve(this.spotify.getUserPlaylists(user.body.id))
    .then((playlists) => {
      this.playlists = playlists.body.items.map((playlist: any) => new Playlist(playlist, this.spotify, vscode.TreeItemCollapsibleState.Collapsed));
     }));
    } catch (err: any) {
      vscode.window.showErrorMessage(err);
    }
  }

  getChildren(element?: Playlist): Promise<vscode.TreeItem []> {
    if (element) {
      return Promise.resolve(element.tracks);
    } else {
      return Promise.resolve(this.playlists);
    }
    
  }

  getTreeItem(element: Playlist): vscode.TreeItem {
    return element;
  }
}


export class Playlist extends vscode.TreeItem {
  name: string;
  id: string;
  tracks: Track[];
  collapsibleState: vscode.TreeItemCollapsibleState;

  constructor (public readonly data: any, private spotify: SpotifyWebApi, public readonly state: vscode.TreeItemCollapsibleState) {
    super(data.name, state);
    this.name = data.name;
    this.id = data.id;
    this.tracks = this.getPlaylistTracks(data.id, this.spotify);
    this.collapsibleState = state;

    this.contextValue = 'playlist';
    this.description = data.name;
  }
  
  getPlaylistTracks(id: string, spotify: SpotifyWebApi) {
    // const user = Promise.resolve(this.spotify.getMe());
    // vscode.window.showInformationMessage(user.body.id);
    this.spotify.getPlaylistTracks(id).then(tracksObj => {
      return tracksObj.body.items.map((data: any) => new Track(data));
    });

    return [];
  }
}