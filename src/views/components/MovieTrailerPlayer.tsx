import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MovieTrailer } from '../../models/Movie'

interface MovieTrailerPlayerProps {
  trailer: MovieTrailer
  backdrop?: string | null
  className?: string
  label: string
}

function sendPlayerCommand(frame: HTMLIFrameElement | null, command: string) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func: command, args: [] }),
    'https://www.youtube-nocookie.com',
  )
}

function getPlayerState(data: unknown) {
  if (typeof data !== 'string') return null
  try {
    const message = JSON.parse(data) as {
      event?: string
      info?: number | { playerState?: number }
    }
    if (message.event === 'onStateChange' && typeof message.info === 'number') {
      return message.info
    }
    if (message.event === 'infoDelivery' && typeof message.info === 'object' && message.info) {
      return message.info.playerState ?? null
    }
  } catch {
    return null
  }
  return null
}

export function MovieTrailerPlayer({
  trailer,
  backdrop,
  className = '',
  label,
}: MovieTrailerPlayerProps) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [playing, setPlaying] = useState(true)
  const [playbackStarted, setPlaybackStarted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    if (!playerReady) return
    sendPlayerCommand(frame.current, 'mute')
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
      'https://www.youtube-nocookie.com',
    )
    sendPlayerCommand(frame.current, playing ? 'playVideo' : 'pauseVideo')
  }, [playerReady, playing, trailer.videoId])

  useEffect(() => {
    const currentFrame = frame.current
    const handlePlayerMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube-nocookie.com' || event.source !== currentFrame?.contentWindow) return
      const state = getPlayerState(event.data)
      if (state !== null) {
        if (state === 1) {
          setPlaybackStarted(true)
          setPlaying(true)
        }
        if (state === 2 || state === 0) setPlaying(false)
      }
    }

    window.addEventListener('message', handlePlayerMessage)
    return () => {
      window.removeEventListener('message', handlePlayerMessage)
      sendPlayerCommand(currentFrame, 'pauseVideo')
    }
  }, [trailer.videoId])

  const embedUrl = new URL(trailer.embedUrl)
  embedUrl.search = new URLSearchParams({
    autoplay: '1',
    controls: '0',
    enablejsapi: '1',
    loop: '1',
    mute: '1',
    origin: window.location.origin,
    playlist: trailer.videoId,
    playsinline: '1',
    rel: '0',
  }).toString()

  return (
    <div className={`movie-trailer-player ${className} ${playbackStarted ? 'is-playing' : ''}`}>
      {backdrop && <img alt="" className="movie-trailer-backdrop" src={backdrop} />}
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="movie-trailer-frame"
        onLoad={() => {
          setPlayerReady(true)
          sendPlayerCommand(frame.current, 'mute')
          sendPlayerCommand(frame.current, 'playVideo')
          window.setTimeout(() => setPlaybackStarted(true), 400)
        }}
        ref={frame}
        referrerPolicy="strict-origin-when-cross-origin"
        src={embedUrl.toString()}
        title={`${label} official trailer on YouTube`}
      />
      <button
        aria-label={playing ? 'Pause trailer' : 'Play trailer muted'}
        onClick={() => {
          setPlaying((current) => !current)
        }}
        type="button"
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
        {playing ? 'Pause trailer' : 'Play trailer muted'}
      </button>
      <a className="movie-trailer-watch" href={trailer.watchUrl} rel="noreferrer" target="_blank">
        Watch on YouTube
      </a>
    </div>
  )
}
