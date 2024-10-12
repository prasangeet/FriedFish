'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, ThumbsUp, Share2 } from "lucide-react"
import { auth, db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/videos/${videoId}/comments`
      )

      if (response.ok) {
        const data = await response.json()
        setComments(data)
        console.log("Fetched comments:", data)
      } else {
        console.log("Failed to load comments:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("User is not authenticated")
      return
    }
    const userId = currentUser.uid

    try {
      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)
      if (userDoc.exists()) {
        setUserName(userDoc.data().displayName)
      }
      console.log(userName);
      

      const response = await fetch(
        `http://localhost:5000/api/videos/${videoId}/comments`,
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
          }),
        }
      )

      if (response.ok) {
        setNewComment("")
        fetchComments()
      } else {
        const errorData = await response.json()
        console.error("Error posting comment:", errorData.error)
      }
    } catch (error) {
      console.error("Error fetching user name:", error)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Comments</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
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
                <AvatarImage src={`/placeholder-avatar.jpg`} alt={comment.user} />
                <AvatarFallback>{comment.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{comment.user}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.timestamp).toLocaleString()}
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
  )
}