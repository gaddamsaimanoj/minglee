// components/BookingRequests.js
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [mapsLink, setMapsLink] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "bookings"), where("to", "==", user.uid));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(results);
    };
    fetchRequests();
  }, []);

  const handleRespond = async (id, accept) => {
    const user = auth.currentUser;
    if (!user) return;

    const update = {
      status: accept ? "accepted" : "rejected",
    };

    if (accept && mapsLink) {
      update.mapsLink = mapsLink;
    }

    await updateDoc(doc(db, "bookings", id), update);
    alert("Response submitted");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Incoming Booking Requests</h2>
      {requests.length === 0 && <p>No requests yet.</p>}
      {requests.map((req, idx) => (
        <div
          key={idx}
          className="border rounded p-4 mb-4 bg-white shadow-sm"
        >
          <p className="font-semibold mb-1">From: {req.from}</p>
          <p className="text-sm mb-1">
            Services: {req.services.map((s) => s.name).join(", ")}
          </p>
          <p className="text-sm mb-2">Time Slot: {req.timeSlot}</p>

          {req.status === "pending" ? (
            <div>
              <input
                type="text"
                placeholder="Paste Google Maps link"
                className="w-full border p-2 rounded mb-2"
                value={mapsLink}
                onChange={(e) => setMapsLink(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-4 py-1 rounded mr-2"
                onClick={() => handleRespond(req.id, true)}
              >
                Accept & Share Location
              </button>
              <button
                className="bg-red-500 text-white px-4 py-1 rounded"
                onClick={() => handleRespond(req.id, false)}
              >
                Reject
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Status: {req.status}</p>
          )}
        </div>
      ))}
    </div>
  );
}
