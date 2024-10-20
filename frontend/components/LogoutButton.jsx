// components/LogoutButton.jsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase"; // Import your Firebase auth instance
import { signOut } from "firebase/auth"; // Import signOut function

const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api";
const API_ROUTE_LOCAL = "http://localhost:5000/api"; // Add your local API route

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      // Try local API first for logout
      let response = await fetch(`${API_ROUTE_LOCAL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        router.push("/");
      } else {
        const errorData = await response.json();
        console.error("Error during logout:", errorData.error);
      }
    } catch (error) {
      try {
        await signOut(auth);
        let response = await fetch(`${API_ROUTE_GLOBAL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          localStorage.removeItem("token");
          router.push("/");
        } else {
          const errorData = await response.json();
          console.error("Error during logout:", errorData.error);
        }

      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  return (
    <Button onClick={handleLogout} className="w-full">
      Logout
    </Button>
  );
};

export default LogoutButton;