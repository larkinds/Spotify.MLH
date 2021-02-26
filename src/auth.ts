import * as crypto from 'crypto';
import SpotifyWebApi = require('spotify-web-api-node');
import * as vscode from 'vscode';

// Auth config
const NAME = 'spotifymlh'; // From package.json
const PUBLISHER = 'goofies'; // From package.json
const PATH = '/authorized';

/** Callback URI that opens VS Code after user authorization.
 * 
 * Be sure to add this URI to the list of allowed callbacks in the
 * {@link https://developer.spotify.com/dashboard/applications Spotify for Developers Dashboard}.
 */
export const redirectUri = `${vscode.env.uriScheme}://${PUBLISHER}.${NAME}${PATH}`;

export class SpotifyCallbackHandler implements vscode.UriHandler {
    /**
     * Finishes Spotify authentication after receiving the callback from a web browser
     * @implements {vscode.UriHandler}
     * @param {SpotifyWebApi} spotify - API object to authenticate
     * @param {string} state - Anti-CSRF token
     */
    constructor(private spotify: SpotifyWebApi, private readonly state: string) {}

    handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
        // Spooky code from https://github.com/microsoft/vscode/blob/main/extensions/github-authentication/src/githubServer.ts
        // Makes an object with query variables/values as properties/values
        const query: any = uri.query.split('&').reduce((map: any, current: string) => {
            const variable = current.split('=');
            map[variable[0]] = variable[1];
            return map;
        }, {});

        if (query.error) {
            vscode.window.showErrorMessage(`Error getting authorization code: ${query.error}`);
            return;
        }
        if (query.state !== this.state) {
            vscode.window.showErrorMessage("Ignored request because its CSRF token didn't match.");
            return;
        }
        if (!query.code) {
            vscode.window.showErrorMessage("Spotify did not successfully authenticate (missing 'code' property in response).");
            return;
        }

        this.spotify.authorizationCodeGrant(query.code).then(
            data => {
                this.spotify.setAccessToken(data.body['access_token']);
                this.spotify.setRefreshToken(data.body['refresh_token']);
                vscode.window.showInformationMessage("Successfully authenticated with Spotify.");
            },
            err => {
                vscode.window.showErrorMessage(`Error exchanging authorization code for access token: ${err}`);
            }
        );
    }
}

/**
 * Opens a window for the user to authorize the application
 * @param {SpotifyWebApi} spotify - API object to authorize
 * @returns {string} Anti-CSRF state token used in authorization request
 */
export function openAuthWindow(spotify: SpotifyWebApi): string {
	const state = crypto.randomBytes(8).toString('hex');
	const authUrl = spotify.createAuthorizeURL([
		'user-follow-read',
    'user-library-modify',
    'user-library-read',
		'user-modify-playback-state',
		'user-read-playback-state',
		'user-read-recently-played'
	], state);
	vscode.env.openExternal(vscode.Uri.parse(authUrl));
    return state;
}
