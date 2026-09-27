import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6e4vTUKYx_yokcEXafE1-Nv29Wp4h6hQ",
    authDomain: "dttracker-64db8.firebaseapp.com",
    projectId: "dttracker-64db8",
    storageBucket: "dttracker-64db8.firebasestorage.app",
    messagingSenderId: "5103251352",
    appId: "1:5103251352:web:3161c7f45206fc6cda45ed",
    measurementId: "G-KGHL0K59BW"
};

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);
