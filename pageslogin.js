// pages/login.js
import { useState } from "react";
import { auth, db, provider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [role, setRole] = useState("");
  const [card, setCard] = useState(null);
  const [photo, setPhoto] = useState(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        name: user.displayName,
        email: user.email,
        role: "man",
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
    }

    alert("Logged in as Man. Redirecting...");
    router.push("/browse");
  };

  const handleSocialWorkerRegister = async () => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const fakeUID = Date.now().toString(); // Simulate anonymous
      const userDoc = {
        name: `Worker${fakeUID.slice(-4)}`,
        email: `worker${fakeUID}@demo.com`,
        role: "woman",
        socialWorkerCard: reader.result,
        approved: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "profiles", fakeUID), userDoc);
      alert("Profile submitted. Await admin approval.");
      router.push("/");
    };
    reader.readAsDataURL(card);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Login</h1>

      <div>
        <h2 className="font-semibold mb-2">I'm a Woman (Social Worker)</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCard(e.target.files[0])}
        />
        <button
          className="mt-2 bg-pink-600 text-white px-4 py-2 rounded"
          disabled={!card}
          onClick={handleSocialWorkerRegister}
        >
          Submit Profile for Approval
        </button>

        <div className="mt-2 text-sm text-blue-700 underline">
          <a
            href="https://www.nationalhealthmission.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Don’t have a Social Worker Card? Apply here
          </a>
        </div>
      </div>

      <hr />

      <div>
        <h2 className="font-semibold mb-2">I'm a Man (Google Login)</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <button
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!photo}
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>
        <p className="text-xs text-gray-500 mt-1">
          * Live photo is required for verification. It won't appear on your profile.
        </p>
      </div>
    </div>
  );
}
