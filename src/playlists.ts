import * as vscode from 'vscode';



export class PlaylistsProvider implements vscode.TreeDataProvider<Playlist> {
  constructor(private spotify: any) {}


  getChildren(element?: Playlist): Thenable<Playlist[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const user = this.spotify.getMe();

    return Promise.resolve(this.spotify.getUserPlaylists(user.id)
    .then((data) => {
      return Promise.resolve(data.body.items.map((playlist: any) => new Playlist(playlist.name)));
    },function(err) {
      console.log('Something went wrong!', err);
    })
  );
  }

  getTreeItem(element: Playlist): vscode.TreeItem {
    return element;
  }

}

export class Playlist extends vscode.TreeItem {
  constructor (public readonly name: string) {
    super(name);
    this.description = name;
    this.tooltip = new vscode.MarkdownString(`name`);
  }
}