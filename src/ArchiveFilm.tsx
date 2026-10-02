import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { ArchiveFilm as Film } from './film-data';

const clock = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

export default function ArchiveFilm({ film, reduced, onEnded }: { film: Film; reduced: boolean; onEnded: (ended: boolean) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [fullscreen, setFullscreen] = useState(false);
  const [screenMessage, setScreenMessage] = useState('');
  const [ended, setEnded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);

  const play = () => {
    const element = video.current;
    if (!element) return;
    if (element.ended) { element.currentTime = 0; setEnded(false); onEnded(false); }
    void element.play().catch(() => { if (mounted.current) setPlaying(false); });
  };
  const toggle = () => { if (video.current?.paused) play(); else video.current?.pause(); };
  const seek = (next: number) => {
    if (!video.current || !duration) return;
    video.current.currentTime = Math.max(0, Math.min(duration, next));
    setTime(video.current.currentTime); setEnded(false); onEnded(false);
  };
  const expand = async () => {
    const element = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (surface.current?.requestFullscreen) await surface.current.requestFullscreen();
      else if (element?.webkitEnterFullscreen) element.webkitEnterFullscreen();
      else setScreenMessage('Fullscreen isn’t available in this browser.');
    } catch { setScreenMessage('Fullscreen isn’t available in this browser.'); }
  };

  useEffect(() => {
    mounted.current = true;
    const element = video.current!;
    const pauseHidden = () => { if (document.hidden) element.pause(); };
    const screenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('visibilitychange', pauseHidden);
    document.addEventListener('fullscreenchange', screenChange);
    if (!reduced) void element.play().catch(() => {});
    return () => {
      mounted.current = false;
      document.removeEventListener('visibilitychange', pauseHidden);
      document.removeEventListener('fullscreenchange', screenChange);
      element.pause();
    };
  }, [film.src, attempt]);
  useEffect(() => { if (reduced) video.current?.pause(); }, [reduced]);
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => { if ((video.current?.readyState || 0) < 2) setStatus('error'); }, 20000);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  return <section className="film-stage" aria-label={film.title}>
    <div ref={surface} className={`film-player ${playing ? 'is-playing' : 'is-paused'} ${ended ? 'is-ended' : ''}`} onKeyDown={event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
      if (event.code === 'Space') { event.preventDefault(); toggle(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); seek(time + 5); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); seek(time - 5); }
    }}>
      <div className="film-screen">
        <video key={attempt} ref={video} src={film.src} poster={film.poster} muted={muted} playsInline preload="metadata" aria-label={film.title}
          onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
          onDurationChange={event => setDuration(event.currentTarget.duration)}
          onCanPlay={event => { setDuration(event.currentTarget.duration); setStatus('ready'); }} onWaiting={() => setStatus('loading')} onPlaying={event => { setDuration(event.currentTarget.duration); setStatus('ready'); setPlaying(true); }}
          onPlay={() => { setPlaying(true); setEnded(false); onEnded(false); }} onPause={() => setPlaying(false)}
          onTimeUpdate={event => { setTime(event.currentTarget.currentTime); if (event.currentTarget.duration > 0) setDuration(event.currentTarget.duration); }}
          onProgress={event => { const element = event.currentTarget; if (element.buffered.length && element.duration) setBuffered(element.buffered.end(element.buffered.length - 1) / element.duration * 100); }}
          onEnded={() => { setEnded(true); setPlaying(false); onEnded(true); }} onError={() => setStatus('error')}/>
        {!playing && status === 'ready' && <button className="film-center-play" aria-label={ended ? 'Replay film' : 'Start film'} onClick={play}>{ended ? <RotateCcw size={27}/> : <Play size={28}/>}</button>}
        {status === 'loading' && <div className="film-status" role="status"><span/> Loading the film…</div>}
        {status === 'error' && <div className="film-unavailable" role="status"><p>This film couldn’t load.</p><span>Retry the video or explore the captures above.</span><button onClick={() => { setStatus('loading'); setPlaying(false); setTime(0); setAttempt(value => value + 1); }}><RotateCcw size={15}/> Retry film</button></div>}
      </div>
      <div className="film-transport">
        <button aria-label={playing ? 'Pause film' : 'Play film'} onClick={toggle}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button>
        <span className="film-clock" aria-hidden="true">{clock(time)} <i>/ {clock(duration)}</i></span>
        <div className="film-timeline" style={{ '--played': `${duration ? time / duration * 100 : 0}%`, '--buffered': `${buffered}%` } as CSSProperties}><input type="range" aria-label="Seek film" aria-valuetext={`${clock(time)} of ${clock(duration)}`} min="0" max={duration || 1} step="0.1" value={Math.min(time, duration || 1)} disabled={!duration || status === 'error'} onChange={event => seek(Number(event.target.value))}/></div>
        <button className="film-sound" aria-label={muted ? 'Unmute film' : 'Mute film'} aria-pressed={!muted} onClick={() => setMuted(value => !value)}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}<span>{muted ? 'Sound off' : 'Sound on'}</span></button>
        <button aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={() => void expand()}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
      </div>
      <div className="film-screen-message" role="status">{screenMessage}</div>
    </div>
    <div className="film-source"><span>{film.kind.toLowerCase()} · original archive</span><span>Presented in its original aspect ratio</span></div>
  </section>;
}
