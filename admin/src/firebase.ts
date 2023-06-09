import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace the following with your app's Firebase project configuration (https://firebase.google.com/docs/web/learn-more#config-object)
const config = {

};

const firebaseApp = initializeApp(config);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(firebaseApp);

export { auth, storage, config };
export default db;
