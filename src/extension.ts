// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clientId, clientSecret } from './secrets';
const crypto = require('crypto');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

// Auth config
const PATH = '/spotify-callback';
const PORT = 8350;

let pauseItem: vscode.StatusBarItem;
let playItem: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const pauseCommand = 'spotifymlh.pause';
    const playCommand = 'spotifymlh.pause';

	let spotify = new SpotifyWebApi({
		redirectUri: `http://localhost:${PORT}${PATH}`,
		clientId,
		clientSecret
	});
	spotifyAuthentication(spotify);

    pauseItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    playItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    pauseItem.command = pauseCommand;
    playItem.command = playCommand;
    context.subscriptions.push(pauseItem);
    context.subscriptions.push(playItem);

    updateStatusBarItem();


	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.play", () => {
		//logic for play on spotify goes here
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.pause", () => {
		// TODO: handle errors etc., see documentation
		vscode.window.showInformationMessage('Attempting to pause...');
		spotify.pause();
	}));

}

function updateStatusBarItem(): void {
    pauseItem.text = `$(debug-pause)`;
    playItem.text = `$(debug-start)`;
    pauseItem.show()
    playItem.show()
}

// this method is called when your extension is deactivated
export function deactivate() {}

function spotifyAuthentication(spotify: typeof SpotifyWebApi) {
	const state = crypto.randomBytes(8).toString('base64');
	const authUrl = spotify.createAuthorizeURL([
		'user-library-modify',
		'user-modify-playback-state',
		'user-read-playback-state',
		'user-read-recently-played'
	], state);
	
	let code = null;
	
	const app = express();
	let server = null;
	app.get(PATH, (req, res) => {
		if (req.query.error) {
			vscode.window.showErrorMessage(req.query.error);
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
			code = req.query.code;
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
	vscode.env.openExternal(authUrl);
}
