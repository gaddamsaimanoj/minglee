// pages/chat/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatBooking() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      const ref = doc(db, "profiles", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [id]);

  const handleToggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleBook = async () => {
    const user = auth.currentUser;
    if (!user || !id || !selectedServices.length || !timeSlot) return;

    const chosen = profile.pricing.filter((p) => selectedServices.includes(p.name));
    const total = chosen.reduce((sum, s) => sum + parseInt(s.price), 0);

    // Simulate payment step (add Razorpay later)
    alert(`Payment simulated for ₹${total}`);

    await setDoc(doc(collection(db, "bookings")), {
      from: user.uid,
      to: id,
      services: chosen,
      timeSlot,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setIsBooked(true);
  };

  if (!profile) return <p className="p-6">Loading chat...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Chat & Booking with {profile.name}</h1>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Select Services</h2>
        {profile.pricing.map((s, idx) => (
          <label key={idx} className="block text-sm">
            <input
              type="checkbox"
              checked={selectedServices.includes(s.name)}
              onChange={() => handleToggleService(s.name)}
              className="mr-2"
            />
            {s.name} - ₹{s.price}
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Time Slot</label>
        <input
          type="datetime-local"
          className="border p-2 rounded w-full"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        />
      </div>

      {!isBooked ? (
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          onClick={handleBook}
        >
          Confirm & Pay
        </button>
      ) : (
        <p className="text-green-600 font-semibold">Booking sent! Wait for her to respond.</p>
      )}
    </div>
  );
}
