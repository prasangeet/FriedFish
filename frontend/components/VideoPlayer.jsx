import React from 'react'

const VideoPlayer = ({ video }) => {
  return (
    <div className="aspect-w-16 aspect-h-9 mb-6 max-w-[60vw] mx-auto">
      <video
        src={video.videoUrl}
        controls
        className="w-full h-full object-cover rounded-lg max-h-[70vh]"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoPlayer