// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import express = require('express');
import { Server } from 'http';
import SpotifyWebApi = require('spotify-web-api-node');
import {PlaylistsProvider} from './playlists';
import { HistoryProvider } from './history';
import { clientId, clientSecret } from './secrets';
import Track from './track';

// Auth config
const PATH = '/spotify-callback';
const PORT = 8350;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let spotify: SpotifyWebApi = new SpotifyWebApi({
		redirectUri: `http://localhost:${PORT}${PATH}`,
		clientId,
		clientSecret
	});
	spotifyAuthentication(spotify);

	const historyProvider = new HistoryProvider(spotify, context);
	vscode.window.registerTreeDataProvider('spotify-history', historyProvider);
	vscode.window.registerTreeDataProvider('spotify-history', new HistoryProvider(spotify, context));
	vscode.window.registerTreeDataProvider('spotify-playlists', new PlaylistsProvider(spotify));

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

function spotifyAuthentication(spotify: SpotifyWebApi) {
	const state = crypto.randomBytes(8).toString('base64');
	const authUrl = spotify.createAuthorizeURL([
		'user-library-modify',
		'user-modify-playback-state',
		'user-read-playback-state',
		'user-read-recently-played'
	], state);
	
	let code = null;
	
	const app = express();
	let server: Server;
	app.get(PATH, (req, res) => {
		if (req.query.error) {
			vscode.window.showErrorMessage(req.query.error.toString());
			// server.close();
		} else if (!req.query.code) {
			vscode.window.showErrorMessage("Spotify did not successfully authenticate (missing 'code' property in response).");
			res.send("Spotify did not successfully authenticate (missing 'code' property in response).");
			// server.close();
		} else if (req.query.state !== state) {
			vscode.window.showErrorMessage('Possible CSRF attack: received different response state from request state.');
			res.send('Possible CSRF attack: received different response state from request state.');
			// server.close();
		} else {
			code = req.query.code.toString();
			spotify.authorizationCodeGrant(code).then(
				data => {
					spotify.setAccessToken(data.body['access_token']);
    				spotify.setRefreshToken(data.body['refresh_token']);
				},
				err => {
					vscode.window.showErrorMessage(`Error exchanging authorization code for access token: ${err}`);
				}
			);
			res.send('You may now close this tab.');
			vscode.window.showInformationMessage("Successfully authenticated with Spotify.");
			server.close();
		}
	});
	server = app.listen(PORT);
	vscode.env.openExternal(vscode.Uri.parse(authUrl));
}
