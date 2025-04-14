// pages/browse.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function BrowsePage() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState([]);
  const allServices = [
    "Massage",
    "Companionship",
    "Dinner Date",
    "Overnight Stay",
    "Full Service",
  ];

  useEffect(() => {
    const fetchProfiles = async () => {
      const ref = collection(db, "profiles");
      const q = query(ref, where("approved", "==", true));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filters.length === 0 ||
      filters.some((f) =>
        (p.pricing || []).some((s) =>
          s.name.toLowerCase().includes(f.toLowerCase())
        )
      );
    return matchSearch && matchFilter;
  });

  const toggleFilter = (service) => {
    setFilters((prev) =>
      prev.includes(service)
        ? prev.filter((f) => f !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Browse Profiles</h1>

      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Search by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {allServices.map((s) => (
          <button
            key={s}
            className={`px-3 py-1 rounded border ${
              filters.includes(s)
                ? "bg-blue-600 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => toggleFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            <img
              src={p.gallery?.[0] || "/placeholder.jpg"}
              className="w-full h-48 object-cover rounded mb-2"
              alt="Profile"
            />
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-600">{p.location}</p>
            <p className="text-sm mt-1">
              {p.pricing?.map((s) => s.name).join(", ")}
            </p>
            <a
              href={`/profile/${p.id}`}
              className="mt-2 inline-block text-blue-600 font-medium underline"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
