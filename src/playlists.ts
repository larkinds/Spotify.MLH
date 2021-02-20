import * as vscode from 'vscode';
import SpotifyWebApi = require('spotify-web-api-node');
import Track from './track';

//import correct type definitions

//create array of tracks:
//loop through track info using .getPlaylistTracks (map)
//create new track and assign to array of tracks


//options: create playlist with name, id & empty track array
//target each playlist by id
//for each playlist, push each track into the track[] in a separate thing
//then return playlist after track[] is full

//display only name of playlist - use getTreeItem && loadTracks function

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
      return playlists.body.items.map((playlist: any) => new Playlist(playlist.name, (playlist.id) => {
        //implemement
        return []
      } ));
    } catch (err: any) {
      vscode.window.showErrorMessage(err);
      return [];
    }
  }

  getTreeItem(element: Playlist): vscode.TreeItem {
    return element;
  }

  loadTracks() {
    //implementation tbd
  }
}

export class Playlist extends vscode.TreeItem {
  constructor (public readonly name: string, public readonly id: string, public readonly tracks: Track[]) {
    super(name);
    this.description = name;
  }
}
