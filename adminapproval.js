// pages/admin.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export default function AdminPanel() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const ref = collection(db, "profiles");
      const q = query(ref, where("approved", "==", false));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPending(data);
    };
    fetchPending();
  }, []);

  const handleDecision = async (id, approve) => {
    const ref = doc(db, "profiles", id);
    await updateDoc(ref, { approved: approve });
    setPending(pending.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Approval Panel</h1>

      {pending.length === 0 ? (
        <p>No pending profiles.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div
              key={p.id}
              className="border rounded p-4 shadow-md bg-white"
            >
              <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
              <p className="text-sm mb-1">Location: {p.location}</p>
              <p className="text-sm mb-1">
                Services: {(p.pricing || []).map((s) => s.name).join(", ")}
              </p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleDecision(p.id, true)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(p.id, false)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
