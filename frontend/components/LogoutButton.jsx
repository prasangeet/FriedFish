// components/LogoutButton.jsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/firebase"; // Import your Firebase auth instance
import { signOut } from "firebase/auth"; // Import signOut function

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");

      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Button onClick={handleLogout} className="w-full">
      Logout
    </Button>
  );
};

export default LogoutButton;
