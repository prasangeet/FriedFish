// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLHC681BAQn699pw8pTtxiW0Y7MOYOtqA",
  authDomain: "friedfish-4c434.firebaseapp.com",
  projectId: "friedfish-4c434",
  storageBucket: "friedfish-4c434.appspot.com",
  messagingSenderId: "565301562734",
  appId: "1:565301562734:web:cf14800bd973b39659457f",
  measurementId: "G-T6PEFZ0HHH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
