import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";

const VideoDetails = ({ video }) => {
  const [likes, setLikes] = useState(video.likes || 0);
  const [dislikes, setDislikes] = useState(video.dislikes || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // const API_ROUTE_LOCAL = "http://localhost:5000/api";
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api";

  const fetchUserReaction = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_ROUTE_GLOBAL}/videos/${video.id}/reaction`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const { liked: userLiked, disliked: userDisliked } = await response.json();
        setLiked(userLiked);
        setDisliked(userDisliked);
      } else {
        throw new Error("Failed to fetch user reaction from local API");
      }
    } catch (error) {
      console.error("Error fetching user reaction:", error);
    }
  }, [video.id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    try {
      if (liked) {
        await fetch(`${API_ROUTE_GLOBAL}/videos/${video.id}/like`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLiked(false);
        setLikes((prev) => prev - 1);
      } else {
        await fetch(`${API_ROUTE_GLOBAL}/videos/${video.id}/like`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLiked(true);
        setDisliked(false); // Ensure mutual exclusivity
        setLikes((prev) => prev + 1);
        if (disliked) setDislikes((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleDislike = async () => {
    const token = localStorage.getItem("token");
    try {
      if (disliked) {
        await fetch(`${API_ROUTE_GLOBAL}/videos/${video.id}/dislike`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDisliked(false);
        setDislikes((prev) => prev - 1);
      } else {
        await fetch(`${API_ROUTE_GLOBAL}/videos/${video.id}/dislike`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDisliked(true);
        setLiked(false); // Ensure mutual exclusivity
        setDislikes((prev) => prev + 1);
        if (liked) setLikes((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error handling dislike:", error);
    }
  };

  useEffect(() => {
    fetchUserReaction();
  }, [fetchUserReaction]);

  return (
    <div className="mb-6 max-w-[120vh] mx-auto">
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {video.views} views • {video.uploadDate}
        </p>
        <div className="flex space-x-2">
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> {likes}
          </Button>
          <Button
            variant={disliked ? "default" : "outline"}
            size="sm"
            onClick={handleDislike}
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> {dislikes}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
      <p className="text-sm">{video.description}</p>
    </div>
  );
};

export default VideoDetails;
