# spotify.mlh

Spotify.MLH is a lightweight VSCode extension that allows a user to control their spotify player from within their coding environment.

## Development Setup
1. Sign up for a Spotify account (a free account is ok for development, but Premium is required for testing)
1. Log in to [Spotify for Developers](https://developer.spotify.com/dashboard/)
1. Create an app
1. Open the settings for your app and add `vscode://goofies.spotifymlh/authorized` as a redirect URI
1. Clone the repository
   ```shell
   git clone git@github.com:larkinds/Spotify.MLH.git
   ```
1. Open VS Code
   ```shell
   cd Spotify.MLH && code .
   ```
1. Duplicate `src/secrets.ts.txt` and rename it to `src/secrets.ts`
   ```shell
   cp src/secrets.ts.txt src/secrets.ts
   ```
1. Set `clientId` and `clientSecret` in `secrets.ts` to the values found in your developer app settings
1. Install extension dependencies
   ```shell
   npm install
   ```
1. Run the extension by hitting <kbd>F5</kbd> or clicking the `Run Extension` button at the bottom of your screen
1. Once in the new VsCode window, follow the instructions in the pop-ups to authorize the Spotify.MLH to access your spotify

## Features

**Control playback:**
- Play
- Pause
- Next song
- Previous Song
- Add to queue


**Browse library:**
- Playlists
- Liked Albums
- Followed Artists
- History
- Liked Tracks


## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.


