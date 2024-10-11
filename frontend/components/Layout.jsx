import React from 'react'

export default function Layout({ children, darkMode }) {
  return (
    <div className={`relative min-h-screen flex flex-col ${
      darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <style jsx global>{`
        .neon-border {
          border-color: var(--neon-primary);
        }
        .neon-text {
          color: var(--neon-primary);
        }
        .neon-focus:focus {
          border-color: var(--neon-primary);
          box-shadow: 0 0 0 2px var(--neon-primary);
        }
      `}</style>

      <div
        className="fixed inset-0 z-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row flex-grow w-full bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}