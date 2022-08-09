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

Create firebase project and a wep app and enable the Google auth provider. Then
click on the setting icons then `Project Settings`. Scroll to the bottom to
find the sdk config and put that in `lib/firebase.ts`. Then go to the
`Service Account` tab and download the private config json file. Create a file
named `.env.local` in the project directory with these contents using the
coresspending values from the json file.

```
PRIVATE_KEY=
CLIENT_EMAIL=
PROJECT_ID=
```

Then start dev server:

```sh
pnpm dev
```
