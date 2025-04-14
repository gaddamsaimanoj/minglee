// pages/woman-dashboard.js
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const defaultServices = [
  "Massage",
  "Companionship",
  "Dinner Date",
  "Overnight Stay",
  "Full Service",
];

export default function WomanDashboard() {
  const [profile, setProfile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [services, setServices] = useState([]);
  const [location, setLocation] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setServices(data.pricing || []);
        setGallery(data.gallery || []);
        setLocation(data.location || "");
        setMapsLink(data.mapsLink || "");
      }
    };
    loadProfile();
  }, []);

  const handleAddService = () => {
    setServices([...services, { name: "", price: "" }]);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "profiles", user.uid), {
      pricing: services,
      gallery,
      location,
      mapsLink,
    });
    alert("Profile updated!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Profile Dashboard</h1>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Gallery (Image URLs)</label>
        <textarea
          className="w-full border p-2 rounded"
          rows={3}
          value={gallery.join("\n")}
          onChange={(e) => setGallery(e.target.value.split("\n"))}
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Services Offered</label>
        {services.map((s, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Service Name"
              className="border p-2 rounded w-1/2"
              value={s.name}
              onChange={(e) => {
                const newList = [...services];
                newList[idx].name = e.target.value;
                setServices(newList);
              }}
              list="defaultServices"
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded w-1/2"
              value={s.price}
              onChange={(e) => {
                const newList = [...services];
                newList[idx].price = e.target.value;
                setServices(newList);
              }}
            />
          </div>
        ))}
        <datalist id="defaultServices">
          {defaultServices.map((s, idx) => (
            <option key={idx} value={s} />
          ))}
        </datalist>
        <button
          onClick={handleAddService}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Service
        </button>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Service Location</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Google Maps Share Link</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={mapsLink}
          onChange={(e) => setMapsLink(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Paste your live Google Maps sharing link here. This will only be visible to a client after confirmed payment.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Don’t know how to get the link? Open Google Maps → Tap your blue location dot → Share location → Copy link.
        </p>
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Save Profile
      </button>
    </div>
  );
}
