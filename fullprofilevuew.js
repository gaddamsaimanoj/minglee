// pages/profile/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [subscribed, setSubscribed] = useState(false); // Simulated value

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      const ref = doc(db, "profiles", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    const checkSubscription = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setSubscribed(userDoc.data().subscribed);
      }
    };

    fetchProfile();
    checkSubscription();
  }, [id]);

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {profile.name || "Unnamed Profile"}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {profile.gallery?.map((url, i) => (
          <img
            key={i}
            src={url}
            alt="Gallery"
            className="w-full h-48 object-cover rounded"
          />
        ))}
      </div>

      {profile.measurements && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Body Measurements</h2>
          <p className="text-gray-700 text-sm mt-1">{profile.measurements}</p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Services Offered</h2>
        <ul className="text-sm text-gray-800 mt-1">
          {profile.pricing?.map((s, i) => (
            <li key={i}>• {s.name} - ₹{s.price}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Service Location</h2>
        <p className="text-sm text-gray-700 mt-1">{profile.location}</p>
      </div>

      <div className="mt-6">
        {subscribed ? (
          <Link
            href={`/chat/${id}`}
            className="bg-blue-600 text-white px-6 py-2 rounded inline-block"
          >
            Chat / Book
          </Link>
        ) : (
          <p className="text-red-600">
            Please subscribe for ₹499 to start chatting and booking.
          </p>
        )}
      </div>
    </div>
  );
}
