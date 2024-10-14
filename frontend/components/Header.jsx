import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoonIcon,
  SunIcon,
  BellIcon,
  PaletteIcon,
  UserIcon,
  UploadIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  SearchIcon,
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function Header({
  darkMode,
  toggleDarkMode,
  changeNeonColor,
  user,
  setDialogOpen,
  setUploadDialogOpen,
  mobileMenuOpen,
  toggleMobileMenu,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search functionality here
  }

  return (
    <header className="p-4 bg-white/80 dark:bg-slate-900/30 shadow-md transition-colors duration-200 border-b neon-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden neon-text"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
          <h2 className="text-xl font-bold neon-text md:hidden">FriedFish</h2>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm neon-border neon-focus"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute left-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-300 hover:neon-text"
          >
            <BellIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="neon-border hover:bg-neon-primary/10 dark:hover:bg-slate-800"
          >
            {darkMode ? (
              <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
            ) : (
              <MoonIcon className="h-[1.2rem] w-[1.2rem] neon-text" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300 hover:neon-text"
              >
                <PaletteIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm neon-border"
              align="end"
              forceMount
            >
              <DropdownMenuLabel>Choose Neon Color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeNeonColor('blue')}>
                
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeNeonColor('red')}>
                Red
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeNeonColor('green')}>
                Green
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeNeonColor('purple')}>
                Purple
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture || ''} alt="User" />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/80  dark:bg-slate-900/80 backdrop-blur-sm neon-border"
              align="end"
              forceMount
            >
              {user && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                <UploadIcon className="mr-2 h-4 w-4" />
                <span>Upload Video</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}