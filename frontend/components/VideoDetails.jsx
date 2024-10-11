import React from 'react'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'

const VideoDetails = ({ video }) => {
  return (
    <div className="mb-6 max-w-[120vh] mx-auto"> {/* Adjust the max-width here */}
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{video.views} views • {video.uploadDate}</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" /> {video.likes}
          </Button>
          <Button variant="outline" size="sm">
            <ThumbsDown className="mr-2 h-4 w-4" /> {video.dislikes}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
      <p className="text-sm">{video.description}</p>
    </div>
  )
}

export default VideoDetails
