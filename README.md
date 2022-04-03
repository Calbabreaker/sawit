# Sawit

Online posting thingy

## Setup

Create a firebase project and wep app at: https://console.firebase.google.com/.
Then create a firestore database and add the rules to the databse: [firebase.rules](./firebase.rules)

## Developing

First install dependencies:

```sh
pnpm install
```

Create firebase project and wep app then add the config to `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Then start dev server:

```sh
pnpm dev
```
