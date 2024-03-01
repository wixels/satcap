# SATCAP

## Setup

### Prerequisites

- Have an existing [Firebase/Google](https://firebase.google.com/) account
- Have a [Firebase project](https://console.firebase.google.com/) set up
- Have [Firebase CLI installed](https://firebase.google.com/docs/cli#install_the_firebase_cli) on your workstation
- Have the code on your workstation (this is the downloaded zip)
- Have access to a unix based terminal on your workstation
- Have [NPM and NodeJS (nvm recommended)](https://github.com/nvm-sh/nvm#installing-and-updating) installed on your workstation


### Project setup
[Firebase Project docs](https://firebase.google.com/docs/cli#project_aliases)

1. Open this project in VS Code and open the terminal inside VS Code (or open your terminal and `cd` to the project root directory)
2. `firebase login`
3. `firebase use --add`
4. When prompted for which project you want to add, select the project you created in the prequisite step
5. Write your alias (can be anything like e.g. satcap-prod)
6. You are now using your own Firebase project

To switch projects run the following, changing **ALIAS** to a defined alias
```
firebase use ALIAS
```
*Please note, if you're on a project that your Google account does not have access to, you won't be able to deploy.*


### Firestore setup
1. Login to [Firebase console](https://console.firebase.google.com/)
2. Open your project
3. Click on Build -> Firestore Database
5. Click "Create Database"
6. Follow the prompts

### Storage setup
1. Login to [Firebase console](https://console.firebase.google.com/)
2. Open your project
3. Click on Build -> Storage
6. Follow the prompts

### Authentication setup
1. Login to [Firebase console](https://console.firebase.google.com/)
2. Open your project
3. Click on Build -> Authentication
4. Go to the "Sign-in method" tab
5. Click "Add new provider"
6. Turn on "Email/Password"


### Hosting setup
[Hosting docs](https://firebase.google.com/docs/hosting)

**ADMIN_SITE_ID** and **USER_SITE_ID** has to be replaced with a value of your choosing.

riis-satcap-admin
riis-satcap-user

This would however need to be unique across the entire Firebase platform so if you use a value that already exists, you will get an error similar to the below:
```
Error: HTTP Error: 400, Invalid name: `admin-satcap-research` is reserved by another project; try something like `admin-satcap-research-51aa9` instead
```

1. `firebase hosting:sites:create ADMIN_SITE_ID`
2. `firebase hosting:sites:create USER_SITE_ID`
3. `firebase target:apply hosting admin ADMIN_SITE_ID`
4. `firebase target:apply hosting user USER_SITE_ID`

#### **Firebase Application Configuration**

You will need to update the firebase configurations for each app (user & admin) respectively.
##### **Admin**
1. `cd admin/src/`
2. Open firebase.ts in your favourite editor
3. Replace the `config` object with your app's [Firebase project configuration](https://firebase.google.com/docs/web/learn-more#config-object)

##### **User**
1. `cd user/public/_scripts`
2. Open init.js in your favourite editor
3. Replace the `firebaseConfig` object with your app's [Firebase project configuration](https://firebase.google.com/docs/web/learn-more#config-object)

#### **Hosting URL Configuration**
##### **Admin**
1. `cd admin/`
2. Open .env in your favourite editor
3. Set VITE_USER_URL=https://USER_SITE_ID.web.app

### Functions setup
[Functions docs](https://firebase.google.com/docs/functions)

**PLEASE NOTE: Blaze (Pay As You Go) billing option is required to use cloud functions**

1. `cd functions/`
2. `npm i`
3. Open .env in your favourite editor
4. Set ADMIN_URL=https://ADMIN_SITE_ID.web.app
5. Set USER_URL=https://USER_SITE_ID.web.app

## Deploy

Because of the admin website requiring a build before deployment, it is **not** adivsed to run the global `firebase deploy` command as this will cause unforeseen problems.

### Rules and Indexes (Firestore / Storage)
```
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy –only functions:getLocationsFromFirestore
firebase deploy –only functions:getDataFromFirestore
```

### Admin
1. `cd admin/`
2. `npm i && npm run build`
3. `cd ../`
4. `firebase deploy --only hosting:admin`


### User (survey links)
```
firebase deploy --only hosting:user
```

### Functions
You can [read here](https://firebase.google.com/docs/functions/manage-functions#deploy_functions) for more details about Firebase Functions and deployments

Before deploying all functions, we need to have an existing mine in the Firestore Database so that the relevant trigger functions on the `mines` collection will deploy successfully.
```
firebase deploy --only functions:addMine
```
Please see [Initial data import/Add Mine](#add-mine) for how to execute this function **before** running the below:
```
firebase deploy --only functions
```

## Initial data import

To start using the application, you can easily add mines and import packages using cloud functions before accessing the application on the web. 

The current version of the application does not support the creation of mines or packages within the application itself.

### Add Mine
To create your mine without adding it manually on [Firebase console](https://console.firebase.google.com/) you can run the `addMine` cloud function deployed in the [previous step](#functions).

Please change the following:
- {LOCATION} = The location in which the project was deployed e.g. us-central1
- PROJECT_ID} = The ID of the Firebase Project e.g. satcap-research
- {NAME} = The name of the mine you're wanting to create
```
https://{LOCATION}-{PROJECT_ID}.cloudfunctions.net/addMine?name={NAME}
```

Please see the [data architecture](#mines) to understand what can be edited/added to the mine information

### Add Surveys/Packages
In order for the mine to create survey links, the [packages collection](#packages) needs to have the predefined data in it. 

To acheive this, you can run the `importPackages` cloud function deployed in the [previous step](#functions).

Please change the following:
- {LOCATION} = The location in which the project was deployed e.g. us-central1
- {PROJECT_ID} = The ID of the Firebase Project e.g. satcap-research

```
https://{LOCATION}-{PROJECT_ID}.cloudfunctions.net/importPackages
```

### Default Survey Questions
To use the default questions provided per package, you will need to run the `importQuestions` cloud function.

You can view and add questions to each package by going to the "Tool Editor" tab within the admin application.

```
https://{LOCATION}-{PROJECT_ID}.cloudfunctions.net/importQuestions
```

### Create Admin User
Initially, you will have to manually add a person to the "backend" to get started.

All subsequent users can be added the traditional way on the "People" tab within the admin application.

Please see [Data Architecture](#data-architecture) for more information before proceeding to the below steps

1. Login to [Firebase console](https://console.firebase.google.com/)
2. Open your project
3. Click on Build -> Authentication
4. Under the "Users" tab, click "Add user"
5. Enter details and "Add User"
6. Copy UID generated
7. Click on Build -> Firestore Database
8. Click on "mines" collection
9. Click on the mine you're wanting to add the person to
10. Click on the Sub-collection "users" (If not there, create it by clicking "Start collection" within the mine document and skip step 11)
11. Click "Add document"
11. Click "Auto-Id" and add the [following fields](#users) 

## Email / SMS

You will need to enable the following extensions within Firebase:

### Trigger Email
- [Link to extension](https://extensions.dev/extensions/firebase/firestore-send-email)
- Setup with your own SMTP account
- Use **mail** as the collection name


### Send Messages with Twilio (optional)
- [Link to extension](https://extensions.dev/extensions/twilio/send-message)
- Setup with your own Twilio account
- Use **messages** as the collection name

## Data Architecture

### Packages
Collection Id: **packages**

#### Structure
| Field                              | Type          | Value                                                              |
|------------------------------------|---------------|--------------------------------------------------------------------|
| docId                              | string        | Redundant copy of actual doc UID                                   |
| name                               | string        | Name of work package                                               |
| survey                             | map           | Survey information this package links to                           |
| survey.complete                    | map           | Custom messages on completion of a survey                          |
| survey.complete[surveyKey].message | string        | Custom message                                                     |
| survey.complete[surveyKey].type    | string        | Custom heading                                                     |
| survey.shortDescription            | string        | Summary description of survey                                      |
| survey.description                 | string        | Full description of survey                                         |
| survey.key                         | string        | Unique key of survey or parent key of surveys                      |
| survey.title                       | string        | Title of survey or parent title of surveys                         |
| survey.surveys                     | array[map]    | (Optional) list of surveys if package provides more than one       |
| survey.surveys[0].color            | string        | HEX value of theme colour for survey                               |
| survey.surveys[0].description      | string        | Description of survey                                              |
| survey.surveys[0].faqUrl           | string        | URL link to FAQ's for survey                                           |
| survey.surveys[0].key              | string        | Unique key of survey                                               |
| survey.surveys[0].title            | string        | Title of survey                                                    |
| scopes                             | array[string] | List of all menu items this package has access to on the user side |


| Scope       |
|-------------|
| home        |
| survey      |
| information |
| queries     |


### Mines
Collection Id: **mines**

#### Structure
| Field           | Type          | Value                                                               |
|-----------------|---------------|---------------------------------------------------------------------|
| address         | string        | Area of mine                                                        |
| name            | string        | Name of mine                                                        |
| description     | string        | Description of mine                                                 |
| featureImageUrl | string        | URL link to header image                                                |
| imageUrl        | string        | URL link to logo of mine                                                |
| packages        | array[string] | Document ID's of all [packages](#packages) this admin has access to |

### Users
Sub-collection of [mines](#mines)

Collection Id: **users**
#### Structure

| Field         | Type          | Value                                                                                                       |
|---------------|---------------|-------------------------------------------------------------------------------------------------------------|
| authUid       | string        | Value of UID according to authentication user                                                               |
| name          | string        | Name of user                                                                                                |
| mobile        | string        | Mobile number of user                                                                                       |
| email         | string        | Email of user (must be contactable - not required to be same as authentication email)                       |
| isAdmin       | boolean       | true if can manage mine (operations / about etc.) and add people to mine                                    |
| jobTitle      | string        | Job title of user                                                                                           |
| mineId        | string        | Document ID of current mine                                                                                 |
| locationAdmin | array[string] | Document ID's of all locations (operations) this user can manage (is allowed to be null if isAdmin is true) |

### Locations
Sub-collection of [mines](#mines)

Collection Id: **locations**
#### Structure

| Field         | Type          | Value                                                                                                       |
|---------------|---------------|-------------------------------------------------------------------------------------------------------------|
| name          | string        | Name of location                                                                                            |
