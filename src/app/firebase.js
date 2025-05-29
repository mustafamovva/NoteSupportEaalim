// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxj4sLIKCSjDrbg6j3Rz7jBit95LoLFDQ",
  authDomain: "mynotesapptyping.firebaseapp.com",
  projectId: "mynotesapptyping",
  storageBucket: "mynotesapptyping.firebasestorage.app",
  messagingSenderId: "560378771875",
  appId: "1:560378771875:web:d082cd80be6621bc5c8216",
  measurementId: "G-E7491QTSL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db=getFirestore(app);
const auth=getAuth(app);

export {app,db,auth};