import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXaZ11kZRS3WmufY37y8glZ4QYPwVDDgM",
  authDomain: "studio-6210650263-c1585.firebaseapp.com",
  projectId: "studio-6210650263-c1585",
  storageBucket: "studio-6210650263-c1585.firebasestorage.app",
  messagingSenderId: "660131511867",
  appId: "1:660131511867:web:d6de11d012ba2c281a261e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testManual() {
  console.log("Starting MANUAL Firebase Test...");
  try {
    const docRef = await addDoc(collection(db, "test_collection"), {
      text: "Testing hardcoded config",
      time: Timestamp.now()
    });
    console.log("Success! Manual Test ID:", docRef.id);
  } catch (error: any) {
    console.error("Manual Test Error:", error.message);
    if (error.stack) console.error(error.stack);
  }
}

testManual();
