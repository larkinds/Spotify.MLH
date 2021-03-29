import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');

export class AlbumsProvider implements vscode.TreeDataProvider<AlbumsAndTracks> {

  constructor(private spotify: SpotifyWebApi) {}

  async getChildren(element?: AlbumsAndTracks): Promise<AlbumsAndTracks[] | undefined> {
    if (element === undefined) {
      return this.getAlbumsAndTracks(this.spotify);
    }
    return element.children;
  }

  async getTreeItem(element: AlbumsAndTracks): Promise<AlbumsAndTracks> {
    return element;
  }

  async getAlbumsAndTracks(spotify: SpotifyWebApi) {
    try {
      const albums = await this.spotify.getMySavedAlbums();
      return albums.body.items.map((data) => new AlbumsAndTracks(data, this.spotify));
      } catch (err: any) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}


export class AlbumsAndTracks extends vscode.TreeItem {
  name: string;
  artists: string;
  uri: string;
  children: Promise<AlbumsAndTracks[]> | undefined;
  parent: AlbumsAndTracks | undefined;

  constructor (public readonly data: any, spotify?: SpotifyWebApi, parent?: AlbumsAndTracks) {
    super(data.name ?? data.album.name);

    if (spotify) {
      this.name = data.album.name;
      this.uri = '';
      this.artists = '';
      this.children = this.getTracks(data.album.id, spotify);

      this.description = data.album.name;
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.contextValue = 'album';
    } else {
      this.name = data.name;
      this.artists = data.artists.map((artist: any) => artist.name).join(', ');
      this.uri = data.uri;
      this.children = undefined;
      this.parent = parent;

      this.description = this.artists;
      this.contextValue = 'albumTrack';
    }

  }

  async getTracks(id: string, spotify: SpotifyWebApi) {
    let tracks = await spotify.getAlbumTracks(id);
    tracks.body.items[0].name;
    return tracks.body.items.map((track: any) => new AlbumsAndTracks(track));
  }
}
