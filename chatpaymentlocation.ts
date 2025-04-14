// components/ChatWithPayment.js
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export default function ChatWithPayment({ womanId }) {
  const [profile, setProfile] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [paid, setPaid] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, "profiles", womanId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    fetchProfile();
  }, [womanId]);

  const toggleService = (service) => {
    const isSelected = selectedServices.includes(service);
    const updated = isSelected
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);

    const price = updated.reduce((sum, item) => {
      const s = profile.pricing.find((p) => p.name === item);
      return sum + (parseInt(s?.price) || 0);
    }, 0);
    setTotalPrice(price);
  };

  const handlePayment = async () => {
    // Simulate payment logic here
    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "chats", `${user.uid}_${womanId}`), {
      paid: true,
      selectedServices,
    });
    setPaid(true);
    alert("Payment successful. Location unlocked.");
  };

  return (
    <div className="p-4 max-w-xl mx-auto border rounded">
      <h2 className="text-xl font-semibold mb-2">Chat & Booking</h2>

      {profile?.pricing?.map((s, i) => (
        <div key={i} className="flex justify-between mb-2">
          <label>
            <input
              type="checkbox"
              checked={selectedServices.includes(s.name)}
              onChange={() => toggleService(s.name)}
              className="mr-2"
            />
            {s.name}
          </label>
          <span>₹{s.price}</span>
        </div>
      ))}

      <div className="my-4">
        <strong>Total:</strong> ₹{totalPrice}
      </div>

      {!paid ? (
        <button
          onClick={handlePayment}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Pay & Unlock Location
        </button>
      ) : (
        <div className="mt-4 text-green-700">
          <p><strong>Location:</strong></p>
          <a
            href={profile?.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
