import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

let config = {
  apiKey: "AIzaSyAh2eCT0djKwvkvVbT_jMK7OuZcNX05jHQ",
  authDomain: "satcap-research.firebaseapp.com",
  projectId: "satcap-research",
  storageBucket: "satcap-research.appspot.com",
  messagingSenderId: "16504149634",
  appId: "1:16504149634:web:74802b5a7a9a6cf5d6469b",
  measurementId: "G-N3W0HEY5R1",
};
const firebaseApp = initializeApp(config);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(firebaseApp);

export { auth, storage, config };
export default db;
