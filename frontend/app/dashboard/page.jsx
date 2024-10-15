"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MainContent from "@/components/MainContent";
import ProfileDialog from "@/components/ProfileDialog";
import UploadDialog from "@/components/UploadDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const neonColors = {
  blue: { primary: "#3b82f6", secondary: "#60a5fa" },
  red: { primary: "#ef4444", secondary: "#f87171" },
  green: { primary: "#22c55e", secondary: "#4ade80" },
  purple: { primary: "#a855f7", secondary: "#c084fc" },
};

export default function Dashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [neonColor, setNeonColor] = useState("blue");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api"

  const handleInvalidToken = useCallback(() => {
    setShowAlert(true);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }, [router]);

  const fetchUserDetails = useCallback(async (uid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ROUTE_GLOBAL}/profile/${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleInvalidToken();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      console.log("Fetched user details:", data); // Debugging line
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [handleInvalidToken]);

  const fetchVideos = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_ROUTE_GLOBAL}/videos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleInvalidToken();
      return;
    }
    if (response.ok) {
      const data = await response.json();
      setVideos(data);
    } else {
      console.error("Failed to fetch videos");
    }
  }, [handleInvalidToken]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    const savedNeonColor = localStorage.getItem("neonColor") || "blue";
    setNeonColor(savedNeonColor);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      if (currentUser) {
        console.log("User is authenticated:", currentUser);
        console.log("UID:", currentUser.uid);
        setUid(currentUser.uid);
        fetchUserDetails(currentUser.uid);
      } else {
        console.log("No user is signed in.");
        setUid(null);
        setUser(null);
      }
    });

    fetchVideos();

    return () => unsubscribe();
  }, [fetchUserDetails, fetchVideos]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--neon-primary",
      neonColors[neonColor].primary
    );
    document.documentElement.style.setProperty(
      "--neon-secondary",
      neonColors[neonColor].secondary
    );
    document.documentElement.style.setProperty(
      "--neon-primary-rgb",
      hexToRgb(neonColors[neonColor].primary)
    );
  }, [neonColor]);

  

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const changeNeonColor = (color) => {
    setNeonColor(color);
    localStorage.setItem("neonColor", color);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Layout darkMode={darkMode}>
      <Sidebar mobileMenuOpen={mobileMenuOpen} />
      <div className="flex-grow flex flex-col">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          neonColor={neonColor}
          changeNeonColor={changeNeonColor}
          user={user}
          setDialogOpen={setDialogOpen}
          setUploadDialogOpen={setUploadDialogOpen}
          mobileMenuOpen={mobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
        <MainContent videos={videos} />
      </div>
      <ProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        uid={uid}
        fetchUserDetails={fetchUserDetails}
      />
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        fetchVideos={fetchVideos}
      />
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired. Redirecting to login...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Layout>
  );
}