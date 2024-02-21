import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace the following with your app's Firebase project configuration (https://firebase.google.com/docs/web/learn-more#config-object)
const config = {
  apiKey: 'AIzaSyAh2eCT0djKwvkvVbT_jMK7OuZcNX05jHQ',
  authDomain: 'satcap-research.firebaseapp.com',
  projectId: 'satcap-research',
  storageBucket: 'satcap-research.appspot.com',
  messagingSenderId: '16504149634',
  appId: '1:16504149634:web:74802b5a7a9a6cf5d6469b',
  measurementId: 'G-N3W0HEY5R1',
  // apiKey: 'AIzaSyCeZD9jRVQ84IH0zNKHd30a0nA1_cjRRBA',
  // authDomain: 'satcap-riis-b1fd5.firebaseapp.com',
  // projectId: 'satcap-riis-b1fd5',
  // storageBucket: 'satcap-riis-b1fd5.appspot.com',
  // messagingSenderId: '1015250811408',
  // appId: '1:1015250811408:web:1cb485d9f2d8bdd8f12895',
  // measurementId: 'G-Y5NH3XZDV3',
};

const firebaseApp = initializeApp(config);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(firebaseApp);

export { auth, storage, config };
export default db;
