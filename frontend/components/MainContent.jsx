import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoCard from "@/components/VideoCard";

export default function MainContent({ videos }) {
  return (
    <main className="flex-grow p-4 md:p-6 overflow-auto">
      <div className="max-w-full mx-auto space-y-6">
        <Card className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-primary/10 shadow-[0_4px_10px_rgba(var(--neon-primary-rgb),0.1)]">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 neon-text">
              Welcome to FriedFish
            </h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4">
              This is your personalized dashboard. Explore videos, manage your
              bookmarks, and customize your settings.
            </p>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
              Get started by browsing through our curated collection of videos
              below. Don&apos;t forget to bookmark your favorites for easy access
              later!
            </p>
          </CardContent>
        </Card>

        <h3 className="text-lg md:text-xl font-semibold mb-2 neon-text">
          Featured Videos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnailUrl}
              userId={video.userId}
              duration="5:30" // Replace with actual video duration
              views={video.views}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
