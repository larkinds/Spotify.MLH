import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');

export class PlaylistsProvider implements vscode.TreeDataProvider<PlaylistAndTracks> {
  
  constructor(private spotify: SpotifyWebApi) {}

  async getChildren(element?: PlaylistAndTracks): Promise<PlaylistAndTracks[] | undefined> {
    if (element === undefined) {
      return this.getPlaylistAndTracks(this.spotify);
    }
    return element.children;
    
  }
  async getTreeItem(element: PlaylistAndTracks): Promise<PlaylistAndTracks> {
    return element;
  }

  async getPlaylistAndTracks(spotify: SpotifyWebApi) {
    try {
      const user = await this.spotify.getMe();
      const playlists = await this.spotify.getUserPlaylists(user.body.id);
      return playlists.body.items.map((playlist: any) => new PlaylistAndTracks(playlist, this.spotify));
      } catch (err: any) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}


export class PlaylistAndTracks extends vscode.TreeItem {
  name: string;
  artists: string;
  uri: string;
  children: Promise<PlaylistAndTracks[]> | undefined;
  parent: PlaylistAndTracks | undefined;

  //constructor takes in spotify if the obj being instantiated is a playlist and no spotify if its a track -- this is how one obj can represent both
  constructor (public readonly data: any, spotify?: SpotifyWebApi, parent?: PlaylistAndTracks) {
    super(data.name ?? data.track.name);
    
    if (spotify) {
      this.name = data.name;
      this.uri = '';
      this.artists = '';
      this.children = this.getTracks(data.id, spotify);

      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.contextValue = 'playlist';
    } else {
      this.name = data.track.name;
      this.artists = data.track.artists.map((artist: any) => artist.name).join(', ');
      this.uri = data.track.uri;
      this.children = undefined;
      this.parent = parent;

      this.description = this.artists;
      this.contextValue = 'playlistAndTracks';
    }

  }

  async getTracks(id: string, spotify: SpotifyWebApi) {
    let tracksObj = await spotify.getPlaylistTracks(id);
    //figure out how to point the child back to the parent
    
    return tracksObj.body.items.map((data: any) => new PlaylistAndTracks(data));
  }
}
