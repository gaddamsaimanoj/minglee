// pages/browse.js
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function BrowseProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const q = query(collection(db, "profiles"), where("approved", "==", true));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProfiles(data);
      setFiltered(data);

      const uniqueCities = [...new Set(data.map((p) => p.location).filter(Boolean))];
      const allServices = data.flatMap((p) => p.pricing?.map((s) => s.name));
      const uniqueServices = [...new Set(allServices)];

      setCities(uniqueCities);
      setServices(uniqueServices);
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    let results = [...profiles];
    if (search) {
      results = results.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.pricing?.some((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          )
      );
    }
    if (cityFilter) {
      results = results.filter((p) => p.location === cityFilter);
    }
    if (serviceFilter) {
      results = results.filter((p) =>
        p.pricing?.some((s) => s.name === serviceFilter)
      );
    }
    setFiltered(results);
  }, [search, cityFilter, serviceFilter]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Browse Profiles</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by name or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Cities</option>
          {cities.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Services</option>
          {services.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((profile) => (
          <Link key={profile.id} href={`/profile/${profile.id}`}>
            <div className="border rounded p-4 hover:shadow-md cursor-pointer">
              <img
                src={profile.gallery?.[0] || "/no-img.png"}
                alt="profile"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-semibold">
                {profile.name || "Unnamed"}
              </h3>
              <p className="text-sm text-gray-600">{profile.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
