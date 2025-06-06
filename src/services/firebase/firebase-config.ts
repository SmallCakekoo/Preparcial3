// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMHZucoTG5EIMthDe4p5fiOgIQZBVYwPg",
  authDomain: "preparcialdca3.firebaseapp.com",
  projectId: "preparcialdca3",
  storageBucket: "preparcialdca3.appspot.com",
  messagingSenderId: "273194467546",
  appId: "1:273194467546:web:5dfa2cf8e065991615e5e3",
  measurementId: "G-C237E8HZ99",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
