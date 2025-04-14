// pages/admin-approval.js
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

export default function AdminApprovalPanel() {
  const [pendingProfiles, setPendingProfiles] = useState([]);

  useEffect(() => {
    const fetchPendingProfiles = async () => {
      const q = query(collection(db, "profiles"), where("approved", "==", false));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPendingProfiles(data);
    };

    fetchPendingProfiles();
  }, []);

  const handleApproval = async (id, approve) => {
    await updateDoc(doc(db, "profiles", id), { approved: approve });
    setPendingProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Pending Approvals</h1>

      {pendingProfiles.length === 0 ? (
        <p className="text-gray-600">No pending profiles right now.</p>
      ) : (
        pendingProfiles.map((profile) => (
          <div
            key={profile.id}
            className="border rounded-lg p-4 mb-4 shadow-md bg-white"
          >
            <h2 className="text-lg font-semibold">{profile.name || "Unnamed"}</h2>

            <div className="flex gap-4 flex-wrap mt-2">
              {profile.gallery?.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Gallery preview"
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>

            <ul className="mt-2 text-sm text-gray-800">
              {profile.pricing?.map((s, i) => (
                <li key={i}>• {s.name} - ₹{s.price}</li>
              ))}
            </ul>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleApproval(profile.id, true)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve ✅
              </button>
              <button
                onClick={() => handleApproval(profile.id, false)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject ❌
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
