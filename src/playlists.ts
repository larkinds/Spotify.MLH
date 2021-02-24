import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');

export class PlaylistsProvider implements vscode.TreeDataProvider<PlaylistAndTracks> {
  private playlist: any;

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
      vscode.window.showErrorMessage(err);
    }
  }

}


export class PlaylistAndTracks extends vscode.TreeItem {
  name: string;
  artists: any[] | undefined;
  uri: string | undefined;
  children: Promise<PlaylistAndTracks[]> | undefined;

  constructor (public readonly data: any, spotify?: SpotifyWebApi) {
    super(data.name);
    this.name = data.name;
    
    if (spotify) {
      this.children = this.getTracks(data.id, spotify);
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    } else {
      this.artists = data.track.artists.map((artist: any) => artist.name).join(', ');
      this.uri = data.uri;
      this.children = undefined;

      this.description = `${data.track.name} | ${this.artists}`;
    }

  }

  async getTracks(id: string, spotify: SpotifyWebApi) {
    let tracksObj = await spotify.getPlaylistTracks(id);
    // vscode.window.showInformationMessage(tracksObj.body.items[0].track.artists[0].name);
    return tracksObj.body.items.map((data: any) => new PlaylistAndTracks(data));
  }
}

