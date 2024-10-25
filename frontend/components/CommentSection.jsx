"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ThumbsUp, Share2 } from "lucide-react";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [userId, setUserId] = useState("");
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api";
  const API_ROUTE_LOCAL = "http://localhost:5000/api";

  const fetchComments = useCallback(async () => {
    try {
      let response = await fetch(
        `${API_ROUTE_LOCAL}/videos/${videoId}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        const sortedComments = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(sortedComments);
        console.log("Fetched comments:", sortedComments);
      } else {
        console.log("Failed to load comments:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching comments with local api:", error);
      try {
        let response = await fetch(
          `${API_ROUTE_GLOBAL}/videos/${videoId}/comments`
        );
        if (response.ok) {
          const data = await response.json();
          const sortedComments = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setComments(sortedComments);
          console.log("Fetched comments:", sortedComments);
        } else {
          console.log("Failed to load comments:", response.statusText);
        }
      } catch (error) {
        console.log("Failed to load comments:", error);
      }
    }
  }, [videoId]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchDisplayName = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data().displayName);
          setProfilePicture(userDoc.data().profilePicture || ""); // Get profile picture or fallback
        }
      } catch (error) {
        console.error("Error fetching displayName:", error);
      }
    };
    fetchDisplayName();
    fetchComments();
  }, [userId, videoId, fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User is not authenticated");
      return;
    }
    const userId = currentUser.uid;

    try {
      console.log(userName);

      // Try local API first
      let response = await fetch(
        `${API_ROUTE_LOCAL}/videos/${videoId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content: newComment,
            user: userName,
            userId: userId,
            profilePicture: profilePicture,
          }),
        }
      );
      if (response.ok) {
        setNewComment("");
        fetchComments();
      } else {
        const errorData = await response.json();
        console.error("Error posting comment:", errorData.error);
      }
    } catch (error) {
      console.error("Error posting comment from local api..", error);
      try {
        let response = await fetch(
          `${API_ROUTE_GLOBAL}/videos/${videoId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              content: newComment,
              user: userName,
              userId: userId,
              profilePicture: profilePicture,
            }),
          }
        );

        if (response.ok) {
          setNewComment("");
          fetchComments();
        } else {
          const errorData = await response.json();
          console.error("Error posting comment:", errorData.error);
        }
      } catch (error) {
        console.log("Error posting the comment...", error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      let response = await fetch(
        `${API_ROUTE_LOCAL}/videos/${videoId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
      }

      if (response.ok) {
        // Refresh comments after deletion
        fetchComments();
      } else {
        const errorData = await response.json();
        console.error("Error deleting comment:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      try {
        let response = await fetch(
          `${API_ROUTE_GLOBAL}/videos/${videoId}/comments/${commentId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          fetchComments();
        } else {
          const errorData = await response.json();
          console.error("Error deleting comment:", errorData.error);
        }
      } catch (error) {
        console.log("Error deleting the comment:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Comments</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage
                src={profilePicture ? profilePicture : ""}
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="mb-2"
              />
              <Button type="submit">Post Comment</Button>
            </div>
          </div>
        </form>
        <Separator className="my-6" />
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <Avatar>
                <AvatarImage
                  src={comment.profilePicture ? comment.profilePicture : ""}
                  alt={comment.user}
                />
                <AvatarFallback>{comment.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{comment.user}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
                <p className="mt-2">{comment.content}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {comment.user === userName && ( // Show delete button only for the current user's comments
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Load More Comments
        </Button>
      </CardFooter>
    </Card>
  );
}
