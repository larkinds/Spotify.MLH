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

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.


