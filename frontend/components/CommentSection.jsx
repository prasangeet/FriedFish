import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    // Fetch comments from your API
    // This is a placeholder implementation
    const response = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`)
    if (response.ok) {
      const data = await response.json()
      setComments(data)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    // Submit the comment to your API
    // This is a placeholder implementation
    const response = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content: newComment }),
    })
    if (response.ok) {
      setNewComment('')
      fetchComments()
    }
  }

  return (
    <div className='mb-6 max-w-[120vh] mx-auto'>
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <form onSubmit={handleSubmitComment} className="mb-4">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="mb-2"
        />
        <Button type="submit">Post Comment</Button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-bold">{comment.user}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentSection