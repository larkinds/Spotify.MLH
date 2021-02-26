// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';
import { redirectUri, openAuthWindow, SpotifyCallbackHandler } from './auth';
import { HistoryProvider } from './history';
import { PlaylistAndTracks, PlaylistsProvider } from './playlists';
import { AlbumsAndTracks, AlbumsProvider } from './albums';
import { ArtistsAndTracks, ArtistsProvider } from './artists';
import { LikesProvider } from './likes';
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

	// Set up command to bootstrap playback, called in openAuthWindow()
	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.bootstrap", () => {
		spotify.getMyDevices()
		.then(data => {
			if (data.body.devices.length < 1) {
				vscode.window.showInformationMessage("No Spotify clients are online. Open Spotify and try again. If you already have a Spotify device running, try playing a track directly on it to register it with the Spotify API.");
				return;
			}

			let device = data.body.devices[0];
			if (!device.is_active) {
				return spotify.transferMyPlayback([device.id ?? ""])
				.then(() => vscode.window.showInformationMessage(`Successfully connected to ${device.name}.`));
			}

			vscode.window.showInformationMessage(`Successfully connected to ${device.name}.`);
		})
		.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	// Set up authorization callback handler and kick off the process
	context.subscriptions.push(vscode.window.registerUriHandler(new SpotifyCallbackHandler(spotify, openAuthWindow(spotify))));
	

    // Initialise status bar stuff
    renderStatusBar(context);


	vscode.window.registerTreeDataProvider('spotify-likes', new LikesProvider(spotify, context));
	vscode.window.registerTreeDataProvider('spotify-history', new HistoryProvider(spotify, context));

	const playlistProvider = new PlaylistsProvider(spotify);
	vscode.window.registerTreeDataProvider("spotify-playlists", playlistProvider);

	const albumProvider = new AlbumsProvider(spotify);
	vscode.window.registerTreeDataProvider('spotify-albums', albumProvider);

	const artistProvider = new ArtistsProvider(spotify);
	vscode.window.registerTreeDataProvider('spotify-artists', artistProvider);

  

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.play", () => {
		spotify.play()
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.pause", () => {
		spotify.pause()
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

    context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.previous", () => {
		spotify.skipToPrevious()
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

    context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.next", () => {
		spotify.skipToNext()
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.track.play", (track: Track) => {
		// Spotify Web API doesn't currently have a way to start playback fresh from a track, so this is a hack
		spotify.addToQueue(track.uri)
			.then(() => spotify.skipToNext())
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.track.queue", (track: Track) => {
		spotify.addToQueue(track.uri)
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.playlisttrack.play", (playlistAndTracks: PlaylistAndTracks) => {
		spotify.addToQueue(playlistAndTracks.uri)
			.then(() => spotify.skipToNext())
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.playlisttrack.queue", (playlistAndTracks: PlaylistAndTracks) => {
		spotify.addToQueue(playlistAndTracks.uri)
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.albumtrack.play", (albumsAndTracks: AlbumsAndTracks) => {
		spotify.addToQueue(albumsAndTracks.uri)
			.then(() => spotify.skipToNext())
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.albumtrack.queue", (albumAndTracks: AlbumsAndTracks) => {
		spotify.addToQueue(albumAndTracks.uri)
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.artisttrack.play", (artistAndTracks: ArtistsAndTracks) => {
		spotify.addToQueue(artistAndTracks.uri)
			.then(() => spotify.skipToNext())
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.artisttrack.queue", (artistAndTracks: ArtistsAndTracks) => {
		spotify.addToQueue(artistAndTracks.uri)
			.catch(error => vscode.window.showErrorMessage(error.message));
	}));

	
}

// this method is called when your extension is deactivated
export function deactivate() {}
