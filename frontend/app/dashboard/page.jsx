"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MoonIcon,
  SunIcon,
  VideoIcon,
  HomeIcon,
  BookmarkIcon,
  SettingsIcon,
  BellIcon,
  UserIcon,
  CameraIcon,
  PaletteIcon,
  MenuIcon,
  XIcon,
  PlayIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "@/components/LogoutButton.jsx";
import VideoCard from "@/components/VideoCard.jsx";

const neonColors = {
  blue: { primary: "#3b82f6", secondary: "#60a5fa" },
  red: { primary: "#ef4444", secondary: "#f87171" },
  green: { primary: "#22c55e", secondary: "#4ade80" },
  purple: { primary: "#a855f7", secondary: "#c084fc" },
};

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [neonColor, setNeonColor] = useState("blue");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileUpdateProgress, setProfileUpdateProgress] = useState(0);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        console.error("Failed to fetch videos");
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    const savedNeonColor = localStorage.getItem("neonColor") || "blue";
    setNeonColor(savedNeonColor);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

    return () => unsubscribe();
  }, []);

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

  const fetchUserDetails = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUser(data);
      setDisplayName(data.displayName || "");
      setProfilePicture(data.profilePicture || null);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token);

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("displayName", displayName);

      if (fileInputRef.current.files[0]) {
        formData.append("profilePicture", fileInputRef.current.files[0]);
      }

      // Simulating a slow upload process
      for (let i = 0; i <= 100; i += 10) {
        setProfileUpdateProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setDialogOpen(false);
      setProfileUpdateProgress(0);
      console.log("Profile successfully updated:", updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileUpdateProgress(0);
    }
  };

  const changeNeonColor = (color) => {
    setNeonColor(color);
    localStorage.setItem("neonColor", color);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUploadVideo = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("title", videoTitle);
      formData.append("description", videoDescription);
      formData.append("thumbnail", thumbnailInputRef.current.files[0]);
      formData.append("video", videoInputRef.current.files[0]);

      // Simulating upload progress
      const simulateUploadProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress > 90) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 500);
      };

      simulateUploadProgress();

      const response = await fetch("http://localhost:5000/api/videos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const result = await response.json();
      console.log("Video successfully uploaded:", result);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadProgress(0);
        // Reset form fields
        setVideoTitle("");
        setVideoDescription("");
        setVideoThumbnail(null);
        setVideoFile(null);
      }, 1000);
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadProgress(0);
    }
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col ${
        darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <style jsx global>{`
        .neon-border {
          border-color: var(--neon-primary);
        }
        .neon-text {
          color: var(--neon-primary);
        }
        .neon-focus:focus {
          border-color: var(--neon-primary);
          box-shadow: 0 0 0 2px var(--neon-primary);
        }
      `}</style>

      <div
        className="fixed inset-0 z-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row flex-grow w-full bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm">
        <div className="hidden md:block w-64 bg-white/40 dark:bg-slate-900/40 shadow-lg transition-colors duration-200 border-r neon-border">
          <ScrollArea className="h-screen">
            <div className="p-6">
              <h2 className="text-2xl font-bold neon-text mb-6 transition-colors duration-200">
                FriedFish
              </h2>
              <nav className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Videos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  Bookmarks
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-grow flex flex-col">
          <header className="p-4 bg-white/80 dark:bg-slate-900/30 shadow-md transition-colors duration-200 border-b neon-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden neon-text"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? (
                    <XIcon className="h-6 w-6" />
                  ) : (
                    <MenuIcon className="h-6 w-6" />
                  )}
                </Button>
                <h2 className="text-xl font-bold neon-text md:hidden">
                  FriedFish
                </h2>
              </div>
              <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm neon-border neon-focus"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300 hover:neon-text"
                >
                  <BellIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="neon-border hover:bg-neon-primary/10 dark:hover:bg-slate-800"
                >
                  {darkMode ? (
                    <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
                  ) : (
                    <MoonIcon className="h-[1.2rem] w-[1.2rem] neon-text" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 dark:text-gray-300 hover:neon-text"
                    >
                      <PaletteIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm neon-border"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel>Choose Neon Color</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => changeNeonColor("blue")}>
                      Blue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeNeonColor("red")}>
                      Red
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeNeonColor("green")}>
                      Green
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeNeonColor("purple")}>
                      Purple
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.profilePicture || ""}
                          alt="User"
                        />
                        <AvatarFallback>
                          {user?.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white/80  dark:bg-slate-900/80 backdrop-blur-sm neon-border"
                    align="end"
                    forceMount
                  >
                    {user && (
                      <>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.displayName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      <span>Upload Video</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b neon-border">
              <nav className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Videos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  Bookmarks
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </div>
          )}

          <main className="flex-grow p-4 md:p-6 overflow-auto">
            <div className="max-w-full mx-auto space-y-6">
              <Card className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-primary/10 shadow-[0_4px_10px_rgba(var(--neon-primary-rgb),0.1)]">
                <CardContent className="p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 neon-text">
                    Welcome to FriedFish
                  </h2>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
                    This is your personalized dashboard. Explore videos, manage
                    your bookmarks, and customize your settings.
                  </p>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                    Get started by browsing through our curated collection of
                    videos below. Don't forget to bookmark your favorites for
                    easy access later!
                  </p>
                </CardContent>
              </Card>

              <h3 className="text-lg md:text-xl font-semibold mb-2 neon-text">
                Featured Videos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    title={video.title}
                    thumbnail={video.thumbnailUrl}
                    userId={video.userId}
                    duration="5:30" // Replace with actual video duration
                    views={video.views}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-900 dark:text-white neon-border">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white neon-text">
              Edit profile
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="displayName"
                  className="text-right text-gray-900 dark:text-white"
                >
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="col-span-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border neon-focus"
                />
              </div>
              <div className="col-span-4 flex justify-center">
                <div
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Avatar className="h-24 w-24 border-2 neon-border">
                    <AvatarImage src={profilePicture} alt="Profile Picture" />
                    <AvatarFallback>
                      {displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <CameraIcon className="h-8 w-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {profileUpdateProgress > 0 && (
                <div className="col-span-4">
                  <Progress value={profileUpdateProgress} className="w-full" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-neon-primary text-white hover:bg-neon-secondary"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-900 dark:text-white neon-border">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white neon-text">
              Upload Video
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details and upload your video.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadVideo}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="videoTitle"
                  className="text-right text-gray-900 dark:text-white"
                >
                  Title
                </Label>
                <Input
                  id="videoTitle"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="col-span-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border neon-focus"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="videoDescription"
                  className="text-right text-gray-900 dark:text-white"
                >
                  Description
                </Label>
                <Textarea
                  id="videoDescription"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="col-span-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border neon-focus"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="videoThumbnail"
                  className="text-right text-gray-900 dark:text-white"
                >
                  Thumbnail
                </Label>
                <div className="col-span-3">
                  <input
                    type="file"
                    id="videoThumbnail"
                    ref={thumbnailInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleThumbnailChange}
                  />
                  <Button
                    type="button"
                    onClick={() => thumbnailInputRef.current.click()}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Choose Thumbnail
                  </Button>
                  {videoThumbnail && (
                    <img
                      src={videoThumbnail}
                      alt="Video Thumbnail"
                      className="mt-2 w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="videoFile"
                  className="text-right text-gray-900 dark:text-white"
                >
                  Video File
                </Label>
                <div className="col-span-3">
                  <input
                    type="file"
                    id="videoFile"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                  <Button
                    type="button"
                    onClick={() => videoInputRef.current.click()}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Choose Video File
                  </Button>
                  {videoFile && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {videoFile.name}
                    </p>
                  )}
                </div>
              </div>
              {uploadProgress > 0 && (
                <div className="col-span-4">
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-neon-primary text-white hover:bg-neon-secondary"
                disabled={uploadProgress > 0}
              >
                {uploadProgress > 0 ? "Uploading..." : "Upload Video"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
