import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');

export class ArtistsProvider implements vscode.TreeDataProvider<ArtistsAndTracks> {

  constructor(private spotify: SpotifyWebApi) {}

  async getChildren(element?: ArtistsAndTracks): Promise<ArtistsAndTracks[] | undefined> {
    if (element === undefined) {
      return this.getArtistsAndTracks(this.spotify);
    }
    return element.children;
  }

  async getTreeItem(element: ArtistsAndTracks): Promise<ArtistsAndTracks> {
    return element;
  }

  async getArtistsAndTracks(spotify: SpotifyWebApi) {
    try {
      const artists = await this.spotify.getFollowedArtists();
      return artists.body.artists.items.map((data) => new ArtistsAndTracks(data, this.spotify));
      } catch (err: any) {
      vscode.window.showErrorMessage(err);
    }
  }
}


export class ArtistsAndTracks extends vscode.TreeItem {
  name: string;
  uri: string;
  children: Promise<ArtistsAndTracks[]> | undefined;

  constructor (public readonly data: any, spotify?: SpotifyWebApi, parent?: ArtistsAndTracks) {
    super(data);

    if (spotify) {
      this.name = data.name;
      this.uri = '';
      this.children = this.getTracks(data.id, spotify);

      this.description = data.name;
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.contextValue = 'artist';
    } else {
      this.name = data.name;
      this.uri = data.uri;
      this.children = undefined;

      this.description = `${data.name}`;
      this.contextValue = 'artistTrack';
    }

  }

  async getTracks(id: string, spotify: SpotifyWebApi) {
    let tracks = await spotify.getArtistTopTracks(id, 'US');
    return tracks.body.tracks.map((track: any) => new ArtistsAndTracks(track));
  }
}
