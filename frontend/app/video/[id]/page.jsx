'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { auth } from '../../../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import VideoPlayer from '@/components/VideoPlayer'
import VideoDetails from '@/components/VideoDetails'
import CommentSection from '@/components/CommentSection'
import FeaturedVideos from '@/components/FeaturedVideos'
import ProfileDialog from '@/components/ProfileDialog'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const neonColors = {
  blue: { primary: "#3b82f6", secondary: "#60a5fa" },
  red: { primary: "#ef4444", secondary: "#f87171" },
  green: { primary: "#22c55e", secondary: "#4ade80" },
  purple: { primary: "#a855f7", secondary: "#c084fc" },
};

export default function VideoPage() {
  const router = useRouter()
  const params = useParams()
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [uid, setUid] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [neonColor, setNeonColor] = useState('blue')
  const [video, setVideo] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [featuredVideos, setFeaturedVideos] = useState([])

  useEffect(() => {
    console.log('Params:', params);
  
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
  
    const savedNeonColor = localStorage.getItem('neonColor') || 'blue'
    setNeonColor(savedNeonColor)
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User is authenticated:', currentUser)
        console.log('UID:', currentUser.uid)
        setUid(currentUser.uid)
        fetchUserDetails(currentUser.uid)
      } else {
        console.log('No user is signed in.')
        setUid(null)
        setUser(null)
      }
    })
  
    if (params?.id) {
      fetchVideo(params.id)
    } else {
      console.error('Video ID is undefined')
    }

    fetchFeaturedVideos()
  
    return () => unsubscribe()
  }, [params])

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
          result[3],
          16
        )}`
      : null;
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--neon-primary",
      neonColors[neonColor].primary
    );
    document.documentElement.style.setProperty(
      "--neon-secondary",
      neonColors[neonColor].secondary
    );
    document.documentElement.style.setProperty(
      "--neon-primary-rgb",
      hexToRgb(neonColors[neonColor].primary)
    );
  }, [neonColor]);

  const fetchUserDetails = async (uid) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 401) {
        handleInvalidToken()
        return
      }
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const fetchVideo = async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/videos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      handleInvalidToken()
      return
    }
    if (response.ok) {
      const data = await response.json()
      setVideo(data)
    } else {
      console.error('Failed to fetch video')
    }
  }

  const fetchFeaturedVideos = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/videos/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      handleInvalidToken()
      return
    }
    if (response.ok) {
      const data = await response.json()
      setFeaturedVideos(data)
    } else {
      console.error('Failed to fetch featured videos')
    }
  }

  const handleInvalidToken = () => {
    setShowAlert(true)
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const changeNeonColor = (color) => {
    setNeonColor(color)
    localStorage.setItem('neonColor', color)
  }

  return (
    <Layout darkMode={darkMode}>
      <div className="flex-grow flex flex-col">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          neonColor={neonColor}
          changeNeonColor={changeNeonColor}
          user={user}
          setDialogOpen={setDialogOpen}
        />
        <div className="flex-grow flex ">
          <main className="flex-grow p-6">
            {video ? (
              <>
                <VideoPlayer video={video} />
                <VideoDetails video={video} />
                <CommentSection videoId={video.id} />
              </>
            ) : (
              <p>Loading video...</p>
            )}
          </main>
          <aside className="w-80 p-6 border-l border-gray-200 dark:border-gray-700">
            <FeaturedVideos videos={featuredVideos} />
          </aside>
        </div>
      </div>
      <ProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        uid={uid}
        fetchUserDetails={fetchUserDetails}
      />
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired. Redirecting to login...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Layout>
  )
}