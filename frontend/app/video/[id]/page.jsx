"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "../../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import VideoDetails from "@/components/VideoDetails";
import CommentSection from "@/components/CommentSection";
import FeaturedVideos from "@/components/FeaturedVideos";
import ProfileDialog from "@/components/ProfileDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const neonColors = {
  blue: { primary: "#3b82f6", secondary: "#60a5fa" },
  red: { primary: "#ef4444", secondary: "#f87171" },
  green: { primary: "#22c55e", secondary: "#4ade80" },
  purple: { primary: "#a855f7", secondary: "#c084fc" },
};

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [neonColor, setNeonColor] = useState("blue");
  const [video, setVideo] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [featuredVideos, setFeaturedVideos] = useState([]);

  // Define API routes
  const API_ROUTE_LOCAL = "http://localhost:5000/api"; // Local API URL
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api"; // Global API URL

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

  const handleInvalidToken = useCallback(() => {
    setShowAlert(true);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }, [router]);

  const fetchUserDetails = useCallback(
    async (uid) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_ROUTE_LOCAL}/profile/${uid}`, {
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

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error(
          "Error fetching user details using the local api, trying global...",
          error
        );
        try {
          const token = localStorage.getItem("token");
          const globalResponse = await fetch(
            `${API_ROUTE_GLOBAL}/profile/${uid}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (globalResponse.status === 401) {
            handleInvalidToken();
            return;
          }

          if (globalResponse.ok) {
            const data = await globalResponse.json();
            setUser(data);
          } else {
            console.error("Error fetching user details from global API");
          }
        } catch (error) {
          console.error("Error fetching user details", error);
        }
      }
    },
    [handleInvalidToken]
  );

  const fetchVideo = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_ROUTE_LOCAL}/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If local fails, try global API
        if (response.status === 401) {
          handleInvalidToken();
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setVideo(data);
        } else {
          console.error("Failed to fetch video from local API");
        }
      } catch (error) {
        const token = localStorage.getItem("token");
        const globalResponse = await fetch(`${API_ROUTE_GLOBAL}/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (globalResponse.status === 401) {
          handleInvalidToken();
          return;
        }

        if (globalResponse.ok) {
          const data = await globalResponse.json();
          setVideo(data);
        } else {
          console.error("Failed to fetch video from global API");
        }
      }
    },
    [handleInvalidToken]
  );

  const fetchFeaturedVideos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ROUTE_LOCAL}/videos/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If local fails, try global API
      if (response.status === 401) {
        handleInvalidToken();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFeaturedVideos(data);
      } else {
        console.error("Failed to fetch featured videos from local API");
      }
    } catch (error) {
      try {
        const token = localStorage.getItem("token");
        const globalResponse = await fetch(`${API_ROUTE_GLOBAL}/videos/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (globalResponse.status === 401) {
          handleInvalidToken();
          return;
        }

        if (globalResponse.ok) {
          const data = await globalResponse.json();
          setFeaturedVideos(data);
        } else {
          console.error("Failed to fetch featured videos from global API");
        }
      } catch (error) {
        console.error("Failed to fetch from global API", error);
      }
    }
  }, [handleInvalidToken]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    const savedNeonColor = localStorage.getItem("neonColor") || "blue";
    setNeonColor(savedNeonColor);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUid(currentUser.uid);
        fetchUserDetails(currentUser.uid);
      } else {
        setUid(null);
        setUser(null);
      }
    });

    if (params?.id) {
      fetchVideo(params.id);
    } else {
      console.error("Video ID is undefined");
    }

    fetchFeaturedVideos();

    return () => unsubscribe();
  }, [params, fetchVideo, fetchFeaturedVideos, fetchUserDetails]);

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

  return (
    <Layout darkMode={darkMode}>
      <div className="flex-grow flex flex-col">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          neonColor={neonColor}
          changeNeonColor={changeNeonColor}
          user={user}
          setDialogOpen={setDialogOpen}
        />
        <div className="flex-grow flex">
          <main className="flex-grow p-6">
            {video ? (
              <>
                <VideoPlayer video={video} />
                <VideoDetails video={video} />
                <CommentSection videoId={video.id} />
              </>
            ) : (
              <p>Loading video...</p>
            )}
          </main>
          <aside className="w-90 p-6 border-l border-gray-200 dark:border-gray-700">
            <FeaturedVideos videos={featuredVideos} />
          </aside>
        </div>
      </div>
      <ProfileDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={user}
        darkMode={darkMode}
      />
      {showAlert && (
        <Alert className="fixed bottom-0 right-0 m-4 bg-red-500 text-white">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle>Invalid Token</AlertTitle>
          <AlertDescription>
            Your session has expired. Redirecting to login...
          </AlertDescription>
        </Alert>
      )}
    </Layout>
  );
}
