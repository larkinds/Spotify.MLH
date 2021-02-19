// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import { redirectUri, openAuthWindow, SpotifyCallbackHandler } from './auth';
import { HistoryProvider } from './history';
import { clientId, clientSecret } from './secrets';
import Track from './track';

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
	

	const historyProvider = new HistoryProvider(spotify, context);
	vscode.window.registerTreeDataProvider('spotify-history', historyProvider);

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.play", () => {
		//logic for play on spotify goes here
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.pause", () => {
		// TODO: handle errors etc., see documentation
		vscode.window.showInformationMessage('Attempting to pause...');
		spotify.pause();
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
