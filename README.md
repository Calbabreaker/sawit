# Sawit

Online posting web app

## Setup

1. Create firebase project at https://console.firebase.google.com/ and a wep app.
2. Enable the Google auth provider.
3. Go the Firestore database section then to rules and paste the [firebase.rules](./firebase.rules) file into there.
4. Click on the setting icons then `Project Settings`
5. Scroll to the bottom to find the sdk config and put that in [lib/firebase.ts](./lib/firebase.ts).
6. Then go to the `Service Account` tab and download the private config json file.
7. Create a file named `.env.local` in the project directory with these contents using the corresponding values from the json file (make sure to include the quotes):

```
PRIVATE_KEY=
CLIENT_EMAIL=
PROJECT_ID=
```

## Developing

First install dependencies:

```sh
pnpm install
```

Then start the dev server:

```sh
pnpm dev
```
