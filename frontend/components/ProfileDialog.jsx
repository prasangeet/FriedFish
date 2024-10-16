import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CameraIcon } from "lucide-react";

export default function ProfileDialog({
  open,
  onOpenChange,
  user,
  uid,
  fetchUserDetails,
}) {
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api";
  const API_ROUTE_LOCAL = "http://localhost:3000/api"; // Add your local API route
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ""
  ); // Default image URL
  const [profileUpdateProgress, setProfileUpdateProgress] = useState(0);
  const fileInputRef = useRef(null);

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

      // Try local API first for updating the profile
      let response = await fetch(`${API_ROUTE_LOCAL}/profile/${uid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Fallback to global API if local fails
      if (!response.ok) {
        response = await fetch(`${API_ROUTE_GLOBAL}/profile/${uid}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update profile:", errorData);
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setDisplayName(updatedUser.displayName); // Update state after success
      setProfilePicture(updatedUser.profilePicture);
      fetchUserDetails(uid);
      onOpenChange(false);
      setProfileUpdateProgress(0);
      console.log("Profile successfully updated:", updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileUpdateProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-900 dark:text-white neon-border">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white neon-text">
            Edit profile
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Make changes to your profile here. Click save when you&apos;re done.
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
                    {user?.displayName?.charAt(0) || "U"}
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
  );
}
