"use client";

import { useState, useEffect } from "react";
import {
  MoonIcon,
  SunIcon,
  VideoIcon,
  HomeIcon,
  BookmarkIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "@/components/LogoutButton.jsx";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null); // State to hold user details

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User is authenticated:", currentUser);
        console.log("UID:", currentUser.uid);
        setUid(currentUser.uid); // Set user ID
        fetchUserDetails(currentUser.uid); // Fetch user details based on the user ID
      } else {
        console.log("No user is signed in.");
        setUid(null);
        setUser(null);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const fetchUserDetails = async (uid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add this line
        },
      }); // Fetch from the backend
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setUser(data); // Set user details in the state
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

  return (
    <div className="relative min-h-screen flex bg-gray-50 dark:bg-slate-950">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-grow w-full bg-white/10 dark:bg-slate-900/10">
        {/* Sidebar */}
        <div className="w-64 bg-white/40 dark:bg-slate-900/40 shadow-lg transition-colors duration-200 border-r border-blue-200 dark:border-cyan-500 dark:border-opacity-50">
          <ScrollArea className="h-screen">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-cyan-400 mb-6 transition-colors duration-200">
                FriedFish
              </h2>
              <nav className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400"
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Videos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400"
                >
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  Bookmarks
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-grow">
          <div className="h-screen bg-white/30 dark:bg-slate-900/30 flex flex-col transition-colors duration-200">
            {/* Header */}
            <header className="p-4 bg-white/80 dark:bg-slate-900/30 shadow-md transition-colors duration-200 border-b border-blue-200 dark:border-cyan-500 dark:border-opacity-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-64 bg-gray-50 dark:bg-slate-800/80 border-blue-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400"
                  >
                    <BellIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="border-blue-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    {darkMode ? (
                      <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
                    ) : (
                      <MoonIcon className="h-[1.2rem] w-[1.2rem] text-blue-600" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profilePicture || ""} alt="User" />
                          <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
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
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogoutButton/>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Main content area */}
            {/* <ScrollArea className="flex-grow">
              <main className="p-6">
                <h1 className="text-3xl font-bold text-blue-600 dark:text-cyan-400 mb-6 transition-colors duration-200">
                  Dashboard
                </h1>

                <Tabs defaultValue="all" className="mb-6">
                  <TabsList className="bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-lg">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-slate-700/80 dark:data-[state=active]:text-cyan-400 text-gray-700 dark:text-gray-200 rounded"
                    >
                      All Videos
                    </TabsTrigger>
                    <TabsTrigger
                      value="recent"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-slate-700/80 dark:data-[state=active]:text-cyan-400 text-gray-700 dark:text-gray-200 rounded"
                    >
                      Recently Added
                    </TabsTrigger>
                    <TabsTrigger
                      value="popular"
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-slate-700/80 dark:data-[state=active]:text-cyan-400 text-gray-700 dark:text-gray-200 rounded"
                    >
                      Most Popular
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, index) => (
                        <Card
                          key={index}
                          className="overflow-hidden bg-white/80 dark:bg-slate-800/80 transition-colors duration-200 border border-blue-200 dark:border-cyan-500 dark:border-opacity-50 rounded-lg shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-cyan-500/25"
                        >
                          <CardContent className="p-0">
                            <img
                              src={`/placeholder.svg?height=200&width=300&text=Video ${
                                index + 1
                              }`}
                              alt={`Video ${index + 1} Thumbnail`}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="text-lg font-bold text-blue-600 dark:text-cyan-400 mb-2 transition-colors duration-200">
                                Video Title {index + 1}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-200">
                                This is a brief description of Video {index + 1}
                                ...
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                <span>5.2K views</span>
                                <span>2 days ago</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="recent">
                    <p className="text-gray-800 dark:text-cyan-400 transition-colors duration-200">
                      Content for Recently Added videos
                    </p>
                  </TabsContent>
                  <TabsContent value="popular">
                    <p className="text-gray-800 dark:text-cyan-400 transition-colors duration-200">
                      Content for Most Popular videos
                    </p>
                  </TabsContent>
                </Tabs>
              </main>
            </ScrollArea> */}
          </div>
        </div>
      </div>
    </div>
  );
}
