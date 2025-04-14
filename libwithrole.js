// lib/withRole.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export function withRole(Component, allowedRoles) {
  return function ProtectedComponent(props) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkRole = async () => {
        const user = auth.currentUser;
        if (!user) return router.push("/login");

        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.data()?.role;
        if (allowedRoles.includes(role)) setAuthorized(true);
        else router.push("/login");
      };

      checkRole();
    }, []);

    return authorized ? <Component {...props} /> : <div>Loading...</div>;
  };
}
