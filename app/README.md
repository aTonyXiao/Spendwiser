# Spendwiser App

This is the React Native front end for the Spendwiser application for iOS and Android

## Configuration

1. First copy the "config.env-template" into the root of the app folder, renaming the file to a ".env" file
2. Fill out the file, changing the necessary variables for Firebase, etc.
3. For the Google Places API key, after generating from the documentation linked in the User Guide, place it on line 25 of `app.json`
4. If the use of Sentry is desired, configure as set the appropriate variable on line 30 on `App.js`

### Login Configuration

1. In `src/network/backends/firebase/facebook_login.js`, make sure the `appId` on line 10 is set properly as configured in the User Guide
2. In `src/network/backends/firebase/google_login.js`, make sure the constants on lines 5-7 are set properly as configured in the User Guide

## Testing

Requirements:
- Node.js and npm
- Expo-CLI installed
- *OPTIONAL: iOS/Android simulators installed*

### Dependencies:
Install the app module dependencies first by running: `npm install`
To make sure everything is all in order, run the following: `expo install`

### For development:
Run the app using Expo using: `expo start`

Notes:
- To run with on an iOS simulator, press `i` when it prompts you after `expo start` is run
- To run with on an Android emulator, press `a` when it prompts you after `expo start` is run

## Deployment

Follow the User Guide for more details for distribution on the App/Google Play Store