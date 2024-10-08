"use client";

import { useState, useEffect } from "react";
import AuthTabs from "@/components/AuthTabs";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative"
      style={{
        backgroundImage: `url('/images/background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/30 to-secondary/50 dark:from-primary/30 dark:via-primary/20 dark:to-secondary/30"></div>

      {/* Content container */}
      <div className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-md p-6 sm:p-8 lg:max-w-lg">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
          ) : (
            <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Welcome to FriedFish
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Stream your favorite content seamlessly.
        </p>
        <AuthTabs />
      </div>
    </div>
  );
}
