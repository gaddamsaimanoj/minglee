// pages/chat/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [paid, setPaid] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "profiles", id));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    loadProfile();
  }, [id]);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user || !timeSlot || selectedServices.length === 0) return;

    const ref = collection(db, "bookings");
    await addDoc(ref, {
      manId: user.uid,
      womanId: id,
      services: selectedServices,
      timeSlot,
      paid: true, // Simulating Razorpay
      createdAt: serverTimestamp(),
    });

    setPaid(true);
    alert("Payment successful. Await location from the provider.");
  };

  const handleShareLocation = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "messages"), {
      from: id,
      to: router.query.manId,
      type: "location",
      location: profile.location,
      createdAt: serverTimestamp(),
    });

    setLocationShared(true);
    alert("Location shared with the client.");
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Chat with {profile.name}</h1>

      {!paid ? (
        <>
          <h2 className="font-semibold mb-2">Select Services:</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.pricing?.map((s, i) => (
              <button
                key={i}
                onClick={() => toggleService(s.name)}
                className={`px-3 py-1 rounded border ${
                  selectedServices.includes(s.name)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                {s.name} - ₹{s.price}
              </button>
            ))}
          </div>

          <label className="block font-semibold mb-1">Choose Time Slot:</label>
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            placeholder="e.g., 7PM - 9PM"
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={handleBooking}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Pay & Book Now
          </button>
        </>
      ) : !locationShared ? (
        <div className="mt-4">
          <p className="mb-2">You can now request the location.</p>
          <button
            onClick={handleShareLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Share Google Location
          </button>
        </div>
      ) : (
        <p className="text-green-600 mt-4">Location shared!</p>
      )}
    </div>
  );
}
