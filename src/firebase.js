import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAK4gqqtzEj0rQUEJ96K1S9hU_utnuz3do",
  authDomain: "image-upload-44c1d.firebaseapp.com",
  projectId: "image-upload-44c1d",
  storageBucket: "image-upload-44c1d.appspot.com",
  messagingSenderId: "634806735476",
  appId: "1:634806735476:web:e3e13e49c86aecb2f8f721"
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);