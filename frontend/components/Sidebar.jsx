import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HomeIcon, VideoIcon, BookmarkIcon, SettingsIcon } from 'lucide-react'

export default function Sidebar({ mobileMenuOpen }) {
  const menuItems = [
    { icon: HomeIcon, label: 'Home' },
    { icon: VideoIcon, label: 'Videos' },
    { icon: BookmarkIcon, label: 'Bookmarks' },
    { icon: SettingsIcon, label: 'Settings' },
  ]

  return (
    <div className={`hidden md:block w-64 bg-white/40 dark:bg-slate-900/40 shadow-lg transition-colors duration-200 border-r neon-border ${
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    } md:translate-x-0`}>
      <ScrollArea className="h-screen">
        <div className="p-6">
          <h2 className="text-2xl font-bold neon-text mb-6 transition-colors duration-200">
            FriedFish
          </h2>
          <nav className="space-y-4">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start hover:bg-neon-primary/10 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:neon-text"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  )
}