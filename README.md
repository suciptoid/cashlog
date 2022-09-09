# Cashlog

## Development
- Copy `.env.example` to `.env`
- Setup firebase client config in `./firebase.config.json` (from Project Setting>General>Your Apps) 
- Run firebase emulator `npm run emulator`
- Run `npm run dev`


## Test
- Run firebase emulator `npm run emulator`
- Run `npm run test`

## Deploy (Manual)
- Require firebase-tools `npm i -g firebase-tools`
- Run `npm run build`
- Build firebase function adapter `node functions/install.js`
- Run `firebase deploy --only functions,hosting`

## Deploy (Github Actions)
- Obtain firebase cli token [(Guide)](https://firebase.google.com/docs/cli#cli-ci-systems)
- Add `FIREBASE_TOKEN` to Action secret