import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayIcon } from "lucide-react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore"; // Import the required functions

const VideoCard = ({ title, thumbnail, duration, views, userId }) => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    // Fetch the user's displayName based on userId
    const fetchDisplayName = async () => {
      try {
        // Use doc() to create a reference to the user document
        const userDocRef = doc(db, "users", userId); // Change this line
        const userDoc = await getDoc(userDocRef); // Use getDoc() to fetch the document

        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName);
        }
      } catch (error) {
        console.error("Error fetching displayName:", error);
      }
    };

    fetchDisplayName();
  }, [userId]);

  return (
    <Card className="overflow-hidden border-primary/10 shadow-[0_4px_10px_rgba(var(--neon-primary-rgb),0.1)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(var(--neon-primary-rgb),0.2)] hover:-translate-y-1">
      <div className="relative">
        <img src={thumbnail} alt={title} className="w-full h-40 object-cover" />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Uploaded by: {displayName || "Unknown"}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <PlayIcon className="w-4 h-4 mr-1" />
          <span>{views} views</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
