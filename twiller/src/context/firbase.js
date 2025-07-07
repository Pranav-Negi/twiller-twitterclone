import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdt0Jc-YwPXdJ6tSt__xB6zoTo_lSRb2g",
  authDomain: "twiller-777d5.firebaseapp.com",
  projectId: "twiller-777d5",
  storageBucket: "twiller-777d5.firebasestorage.app",
  messagingSenderId: "545405853521",
  appId: "1:545405853521:web:7792a7c9ea0175d36cbd70",
  measurementId: "G-57R5EYG71R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
// const analytics = getAnalytics(app);
