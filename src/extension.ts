// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import { redirectUri, openAuthWindow, SpotifyCallbackHandler } from './auth';
import { HistoryProvider } from './history';
import { PlaylistsProvider } from './playlists';
import { clientId, clientSecret } from './secrets';
import Track from './track';
import { renderStatusBar } from './statusBar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  
	let spotify: SpotifyWebApi = new SpotifyWebApi({
		redirectUri,
		clientId,
		clientSecret
	});

	// Set up authorization callback handler and kick off the process
	context.subscriptions.push(vscode.window.registerUriHandler(new SpotifyCallbackHandler(spotify, openAuthWindow(spotify))));
	

    // Initialise status bar stuff
    renderStatusBar(context);


	const historyProvider = new HistoryProvider(spotify, context);
	vscode.window.registerTreeDataProvider('spotify-history', historyProvider);

	const playlistView = vscode.window.createTreeView('spotify-playlists', {
		treeDataProvider: new PlaylistsProvider(spotify),
	});

	// playlistView.onDidExpandElement((el) => {
	// 	const state = el.element.collapsibleState;
	// 	vscode.window.showInformationMessage(`expanded: ${state}`);
	// 	el.element.collapsibleState = 2;
	// });

	// playlistView.onDidCollapseElement((el) => {
	// 	const state = el.element.collapsibleState;
	// 	vscode.window.showInformationMessage(`collapsed: ${state}`);
	// 	el.element.collapsibleState = 1;
	// });

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.play", () => {
        vscode.window.showInformationMessage('Attempting to play...');
		spotify.play();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.pause", () => {
		// TODO: handle errors etc., see documentation
		vscode.window.showInformationMessage('Attempting to pause...');
		spotify.pause();
	}));

    context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.previous", () => {
		// TODO: handle errors etc., see documentation
		vscode.window.showInformationMessage('Playing the previous song...');
		spotify.skipToPrevious();
	}));

    context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.next", () => {
		// TODO: handle errors etc., see documentation
		vscode.window.showInformationMessage('Playing the next song...');
		spotify.skipToNext();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.track.play", (track: Track) => {
		// Spotify Web API doesn't currently have a way to start playback fresh from a track, so this is a hack
		spotify.addToQueue(track.uri)
			.then(() => spotify.skipToNext());
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.track.queue", (track: Track) => {
		spotify.addToQueue(track.uri);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
