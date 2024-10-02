import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import storage

const firebaseConfig = {
  apiKey: "AIzaSyDKmI373MuTtQKksYupfjkrUiUquwXgh20",
  authDomain: "newgog-7f9ae.firebaseapp.com",
  projectId: "newgog-7f9ae",
  storageBucket: "newgog-7f9ae.appspot.com",
  messagingSenderId: "689908545876",
  appId: "1:689908545876:web:316bfe174c3ec60a5370c1"
};
// Initialize Firebase
const app =!getApps().length? initializeApp(firebaseConfig):getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize storage

export {app,auth,db,storage}