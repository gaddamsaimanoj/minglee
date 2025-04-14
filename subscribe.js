
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    // Simulate successful payment
    await setDoc(doc(db, "subscriptions", user.uid), {
      active: true,
      createdAt: serverTimestamp(),
      method: "test-mode",
    });

    alert("Subscription successful! You can now chat and book.");
    router.push("/");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Subscribe to Unlock Full Access</h1>
      <p className="mb-4">
        One-time payment of ₹499 gives you full access to chat and book services.
      </p>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Processing..." : "Pay ₹499 to Subscribe"}
      </button>
    </div>
  );
}
