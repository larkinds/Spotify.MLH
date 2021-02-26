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

	context.subscriptions.push(vscode.commands.registerCommand('spotifymlh.playlist.play', async (playlistAndTracks: PlaylistAndTracks) => {
		vscode.window.showInformationMessage("meow");
		vscode.window.showInformationMessage(playlistAndTracks.name);
		let tracks = await playlistAndTracks.children;
		

		if (tracks !== undefined) {
			vscode.window.showInformationMessage(tracks[0].name);
			let firstTrackUri: any = tracks[1].uri;
			let tracksURI = tracks?.map((track) => track.uri);
			

			tracks.map((track) => {
				spotify.addToQueue(track.uri);
			});

			let currentTrack = await spotify.getMyCurrentPlayingTrack({market: 'US'});
			if (currentTrack.body.item !== null) {
				vscode.window.showInformationMessage(currentTrack.body.item?.name);
				while (currentTrack.body.item !== null && tracksURI.includes(currentTrack.body.item.uri)) {
					spotify.skipToNext();
					currentTrack = await spotify.getMyCurrentPlayingTrack();
				}
			}
		}
		
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.playlisttrack.play", (playlistAndTracks: PlaylistAndTracks) => {
		spotify.addToQueue(playlistAndTracks.uri)
		.then(() => spotify.skipToNext());
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.playlisttrack.queue", (playlistAndTracks: PlaylistAndTracks) => {
		spotify.addToQueue(playlistAndTracks.uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.albumtrack.play", (albumsAndTracks: AlbumsAndTracks) => {
		spotify.addToQueue(albumsAndTracks.uri)
		.then(() => spotify.skipToNext());
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.albumtrack.queue", (albumAndTracks: AlbumsAndTracks) => {
		spotify.addToQueue(albumAndTracks.uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.artisttrack.play", (artistAndTracks: ArtistsAndTracks) => {
		spotify.addToQueue(artistAndTracks.uri)
		.then(() => spotify.skipToNext());
	}));

	context.subscriptions.push(vscode.commands.registerCommand("spotifymlh.artisttrack.queue", (artistAndTracks: ArtistsAndTracks) => {
		spotify.addToQueue(artistAndTracks.uri);
	}));

	
}

// this method is called when your extension is deactivated
export function deactivate() {}
