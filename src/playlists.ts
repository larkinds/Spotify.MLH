import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');

export class PlaylistsProvider implements vscode.TreeDataProvider<Playlist> {
  constructor(private spotify: SpotifyWebApi) {}

  async getChildren(element?: Playlist): Promise<Playlist[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const user = await this.spotify.getMe();

    const playlists = await this.spotify.getUserPlaylists(user.id);
    if (playlists.body) {
      return playlists.body.items.map((playlist: any) => new Playlist(playlist.name));
    } else {
      return [];
    }
  }

  getTreeItem(element: Playlist): vscode.TreeItem {
    return element;
  }
}

export class Playlist extends vscode.TreeItem {
  constructor (public readonly name: string) {
    super(name);
    this.description = name;
  }
}
