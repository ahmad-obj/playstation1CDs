import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, X } from 'lucide-react';
import { discPath, type Game } from './data';
import { media } from './media-data';
import { films } from './film-data';
import ArchiveFilm from './ArchiveFilm';
import './film.css';

const titles: Record<string, string[]> = {
  'metal-gear-solid': ['SHADOW', 'MOSES.'],
  'final-fantasy-vii': ['BEYOND', 'MIDGAR.'],
  'ridge-racer': ['CHASE THE', 'LAST LIGHT.'],
  'tekken-3': ['ONE MORE', 'ROUND.'],
  'wipeout': ['FUTURE', 'FREQUENCY.'],
  'resident-evil-2': ['AFTER', 'DARK.'],
};

export default function MemoryViewer({ game, nextGame, reduced, onClose, onNext }: { game: Game; nextGame: Game; reduced: boolean; onClose: () => void; onNext: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState<'captures' | 'film'>('film');
  const [filmEnded, setFilmEnded] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frames = media[game.id];
  const film = films[game.id];
  const hasContinuation = (mode === 'film' && filmEnded) || (mode === 'captures' && frame === frames.length - 1);
  const pointer = useRef({ x: 0, y: 0 });
  const move = (direction: number) => { setFrame(value => (value + direction + frames.length) % frames.length); setLoaded(false); setFailed(false); };
  const close = () => { if (closing) return; setClosing(true); setPlaying(false); closeTimer.current = setTimeout(onClose, reduced ? 0 : 480); };

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(closeTimer.current); document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => { if (!document.hidden) { setFrame(value => (value + 1) % frames.length); setLoaded(false); setFailed(false); } }, 5000);
    return () => clearInterval(timer);
  }, [playing, frames.length]);
  useEffect(() => {
    for (const item of frames) { const image = new Image(); image.src = item.src; }
  }, [frames]);
  useEffect(() => {
    if (mode === 'film') return;
    let raf = 0;
    let x = 0, y = 0, last = 0;
    const draw = (time: number) => {
      const dt = Math.min((time - last) / 1000 || .016, .05); last = time;
      const ease = 1 - Math.exp(-dt * 5);
      x += (pointer.current.x - x) * ease; y += (pointer.current.y - y) * ease;
      const wave = reduced ? 0 : Math.sin(time * .00032) * .016;
      const sway = reduced ? 0 : x * .018;
      const shape = `M .065 .19 C .12 ${.035+wave} .33 ${.08-sway} .51 .05 C .71 ${.015+wave} .91 .015 .965 .19 C 1 .35 .965 .56 .952 .71 C .938 .95 .77 ${.947+sway} .56 .95 C .33 ${.954-wave} .135 .99 .052 .84 C ${.012-wave} .71 .018 .4 .065 .19 Z`;
      path.current?.setAttribute('d', shape);
      outline.current?.setAttribute('d', shape);
      if (stage.current) {
        stage.current.style.setProperty('--mx', String(reduced ? 0 : x));
        stage.current.style.setProperty('--my', String(reduced ? 0 : y));
      }
      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const wake = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };
    raf = requestAnimationFrame(draw); document.addEventListener('visibilitychange', wake);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', wake); };
  }, [reduced, mode]);

  return <dialog ref={dialog} className={`memory-viewer ${mode === 'film' ? 'is-film' : ''} ${closing ? 'is-closing' : ''} ${loaded ? 'frame-loaded' : ''} ${hasContinuation ? 'has-continuation' : ''}`} aria-labelledby="memory-title" onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (mode === 'film') return;
    if (event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); move(-1); }
  }}>
    <div className="memory-backdrop" style={{ backgroundImage: `url(${frames[frame].src})` }} aria-hidden="true"/>
    <div className="memory-top"><span>PLAY / BACK <i/> THE MEMORY ROOM</span><span className="memory-game">{game.title} <i>—</i> {game.year}</span><button className="memory-close" onClick={close} aria-label="Close memory room"><span>RETURN TO THE DISC</span><X size={21}/></button></div>
    <div className="memory-mode" role="group" aria-label="Media format"><button aria-pressed={mode === 'film'} onClick={() => { setPlaying(false); setMode('film'); }}>Film <Play size={11}/></button><button aria-pressed={mode === 'captures'} onClick={() => setMode('captures')}>Captures</button></div>
    {mode === 'film' ? <><h2 id="memory-title" className="sr-only">{film.title}</h2>{!closing && <ArchiveFilm film={film} reduced={reduced} onEnded={setFilmEnded}/>}</> : <div ref={stage} className="memory-stage" onPointerMove={event => { const r = event.currentTarget.getBoundingClientRect(); pointer.current = { x: (event.clientX-r.left)/r.width-.5, y: (event.clientY-r.top)/r.height-.5 }; }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }}>
      <svg className="frame-definition" width="0" height="0" aria-hidden="true"><defs><clipPath id="memory-aperture" clipPathUnits="objectBoundingBox"><path ref={path} d="M .065 .19 C .12 .035 .33 .08 .51 .05 C .71 .015 .91 .015 .965 .19 C 1 .35 .965 .56 .952 .71 C .938 .95 .77 .947 .56 .95 C .33 .954 .135 .99 .052 .84 C .012 .71 .018 .4 .065 .19 Z"/></clipPath></defs></svg>
      <div className="memory-orbit" aria-hidden="true"/>
      <div className="memory-image-wrap">
        <div className="memory-aperture">
          <img key={frames[frame].src} className="memory-image" src={frames[frame].src} alt={frames[frame].caption} onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(true); }} />
          <div className="memory-scanlines" aria-hidden="true"/>
          <div className="memory-light" aria-hidden="true"/>
          {failed && <div className="media-error">This memory couldn’t load.<button onClick={() => { setFailed(false); setLoaded(false); setFrame((frame+1)%frames.length); }}>Try the next frame <ArrowRight size={16}/></button></div>}
        </div>
        <svg className="memory-frame-line" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><path ref={outline} d="M .065 .19 C .12 .035 .33 .08 .51 .05 C .71 .015 .91 .015 .965 .19 C 1 .35 .965 .56 .952 .71 C .938 .95 .77 .947 .56 .95 C .33 .954 .135 .99 .052 .84 C .012 .71 .018 .4 .065 .19 Z"/></svg>
      </div>
      <div className="memory-side-note">A PLACE YOU CAN STILL REMEMBER.</div>
      <div className="memory-headline"><h2 id="memory-title">{titles[game.id].map(line => <span key={line}>{line}</span>)}</h2><p>{game.memory}</p></div>
      <div className="memory-frame-count"><span>{String(frame+1).padStart(2,'0')}</span><span>/ {String(frames.length).padStart(2,'0')}</span><i>ORIGINAL<br/>PLAYSTATION CAPTURES</i></div>
    </div>}
    <div className="memory-bottom"><div className="memory-caption" aria-live="polite"><span>{mode === 'film' ? film.kind : `FRAME ${String(frame+1).padStart(2,'0')}`}</span><p>{mode === 'film' ? film.title : frames[frame].caption}</p></div>{mode === 'captures' && <div className="memory-controls"><button className="memory-auto" aria-label={playing ? 'Pause sequence' : 'Autoplay frames'} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14}/> : <Play size={14}/>}<span>{playing ? 'Pause sequence' : 'Autoplay frames'}</span></button><button aria-label="Previous frame" onClick={() => move(-1)}><ArrowLeft size={20}/></button><button aria-label="Next frame" onClick={() => move(1)}><ArrowRight size={20}/></button></div>}</div>
    {mode === 'captures' && <div className="memory-progress" aria-label="Choose a frame">{frames.map((item,index) => <button key={item.src} aria-label={`View frame ${index+1}`} aria-pressed={frame === index} className={`${index === frame ? 'active' : ''} ${playing && index === frame ? 'running' : ''}`} onClick={() => { if (frame !== index) setLoaded(false); setFrame(index); setFailed(false); }}><span key={`${frame}-${playing}`}/></button>)}</div>}
    {hasContinuation && <div className={`memory-continuation ${mode === 'captures' ? 'is-capture-next' : ''}`}><button className="memory-next" onClick={onNext} aria-label={`Next memory: ${nextGame.title}`}><img src={discPath(nextGame)} alt=""/><span><small>One more memory?</small>{nextGame.title}</span><ArrowRight size={19}/></button></div>}
  </dialog>;
}
