"use client"

import { useState, useRef } from "react"
import ReactHowler from "react-howler"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const playerRef = useRef<ReactHowler>(null)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <ReactHowler
        ref={playerRef}
        src="/audio/The-Manhattans-Forever-by-your-s.mp3"
        playing={isPlaying}
        loop={true}
        volume={isMuted ? 0 : volume}
        preload={true}
      />
      
      <div className="bg-white/90 backdrop-blur-sm border border-border/20 rounded-full shadow-lg p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="rounded-full w-10 h-10 p-0 hover:bg-primary/10"
          title={isPlaying ? "Pausar música" : "Tocar música"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 text-primary" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="rounded-full w-8 h-8 p-0 hover:bg-primary/10"
          title={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-slate-600" />
          ) : (
            <Volume2 className="w-3 h-3 text-slate-600" />
          )}
        </Button>

        <div className="text-xs text-slate-600 px-2 hidden sm:block">
          Forever By Your Side
        </div>
      </div>
    </div>
  )
}
