import React from 'react'
import VideoCard from './VideoCard'

const FeaturedVideos = ({ videos }) => {
  return (
    <div className="space-y-4 ">
      <h2 className="text-xl font-bold mb-4">Featured Videos</h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnail={video.thumbnailUrl}
            duration={video.duration}
            views={video.views}
            userId={video.userId}
          />
        ))}
      </div>
    </div>
  )
}

export default FeaturedVideos