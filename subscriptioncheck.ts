// lib/useSubscription.js
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSub = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "subscriptions", user.uid);
      const snap = await getDoc(ref);
      setIsSubscribed(snap.exists() && snap.data().active);
      setLoading(false);
    };
    checkSub();
  }, []);

  return { isSubscribed, loading };
}

// pages/subscribe.js
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

// components/RequireSubscription.js
import useSubscription from "../lib/useSubscription";
import { useRouter } from "next/router";

export default function RequireSubscription({ children }) {
  const { isSubscribed, loading } = useSubscription();
  const router = useRouter();

  if (loading) return <p className="text-center mt-10">Checking subscription...</p>;

  if (!isSubscribed) {
    if (typeof window !== "undefined") {
      router.push("/subscribe");
    }
    return <p className="text-center mt-10">Redirecting to subscription page...</p>;
  }

  return children;
}

// pages/admin/bookings.js
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(list);
    };
    loadBookings();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 All Bookings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Woman</th>
              <th className="px-4 py-2 border">Services</th>
              <th className="px-4 py-2 border">Time</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td className="border px-4 py-2">{b.userId}</td>
                <td className="border px-4 py-2">{b.womanId}</td>
                <td className="border px-4 py-2">{b.services?.join(", ")}</td>
                <td className="border px-4 py-2">{b.time}</td>
                <td className="border px-4 py-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// pages/admin/users.js
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    };
    loadUsers();
  }, []);

  const handleApproval = async (id, approved) => {
    await updateDoc(doc(db, "users", id), { approved });
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, approved } : u)));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👩 Women Account Approval</h1>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Approved</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.approved ? "✅" : "❌"}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleApproval(user.id, true)}
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(user.id, false)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
