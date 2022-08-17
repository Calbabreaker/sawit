# Sawit

Online posting web app

## Setup

Create firebase project at https://console.firebase.google.com/ and a wep app
and enable the Google auth provider. Then go the Firestore database section
then to rules and paste the [firebase.rules](./firebase.rules) file into there.
Then click on the setting icons then `Project Settings`. Scroll to the bottom
to find the sdk config and put that in [lib/firebase.ts](./lib/firebase.ts).
Then go to the `Service Account` tab and download the private config json file.
Create a file named `.env.local` in the project directory with these contents
using the corresponding values from the json file.

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
