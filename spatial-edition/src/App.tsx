import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, RotateCw, Volume2, VolumeX, X, MoveHorizontal, Sun, Moon, Aperture, Play, Grid2X2 } from 'lucide-react';
import { discPath, games, number, wrap } from './data';
import { media } from './media-data';
import { playTone } from './audio';
import type { SceneState } from './DiscScene';

const DiscScene = lazy(() => import('./DiscScene'));
const MemoryViewer = lazy(() => import('./MemoryViewer'));
const wake = () => window.dispatchEvent(new Event('playback:render'));
const initial = Math.max(0, games.findIndex(g => location.hash === `#game/${g.id}`));
const hasGame = games.some(g => location.hash === `#game/${g.id}`);
const pixelsPerDisc = (rect: DOMRect) => rect.height * 6.8 / (rect.width <= 540 ? 2 * Math.max(3.85, 2.96 * rect.height / (rect.width * .85)) : 7.2);

export default function App() {
  const [active, setActive] = useState(hasGame ? initial : 1);
  const [detail, setDetail] = useState(hasGame);
  const [panel, setPanel] = useState<'index' | 'about' | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [sound, setSound] = useState(false);
  const [night, setNight] = useState(false);
  const [world, setWorld] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scene = useRef<SceneState>({ position: active, detail, flipped: false, pointerX: 0, pointerY: 0, dragging: false, reduced, hovering: false, suspended: false, night: false });
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const worldButton = useRef<HTMLButtonElement>(null);
  const inspectButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panelDialog = useRef<HTMLDialogElement>(null);
  const panelTrigger = useRef<HTMLButtonElement | null>(null);
  const memoryDestination = useRef<number | null>(null);
  const drag = useRef({ down: false, moved: false, x: 0, y: 0, previousX: 0, time: 0, velocity: 0, position: 0 });
  const game = games[active];
  useLayoutEffect(() => { document.getElementById('boot-screen')?.remove(); }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setFallback(true); setReady(true); }, []);
  const setPosition = useCallback((position: number) => { scene.current.position = position; setActive(wrap(Math.round(position))); wake(); }, []);
  const resetFlip = () => { setFlipped(false); scene.current.flipped = false; };
  const navigate = useCallback((index: number) => {
    const current = Math.round(scene.current.position);
    let delta = wrap(index - wrap(current)); if (delta > 3) delta -= games.length;
    setPosition(current + delta); resetFlip(); playTone('move', sound);
    if (scene.current.detail) history.replaceState(null, '', `#game/${games[index].id}`);
  }, [setPosition, sound]);
  const step = useCallback((direction: number) => {
    const next = Math.round(scene.current.position) + direction;
    setPosition(next); resetFlip(); playTone('move', sound);
    if (scene.current.detail) history.replaceState(null, '', `#game/${games[wrap(next)].id}`);
  }, [setPosition, sound]);
  const openGame = useCallback((index = active) => {
    navigate(index); setDetail(true); scene.current.detail = true; scene.current.hovering = false;
    history.pushState(null, '', `#game/${games[index].id}`); playTone('select', sound); wake();
    setTimeout(() => closeButton.current?.focus({ preventScroll: true }), 60);
  }, [active, navigate, sound]);
  const closeDetail = useCallback(() => {
    setDetail(false); resetFlip(); scene.current.detail = false; scene.current.hovering = false;
    history.pushState(null, '', '#collection'); wake();
    setTimeout(() => inspectButton.current?.focus({ preventScroll: true }), 60);
  }, []);
  const flip = useCallback(() => { setFlipped(value => { scene.current.flipped = !value; return !value; }); playTone('flip', sound); wake(); }, [sound]);
  const enterWorld = () => { history.pushState({ playbackRoom: true }, '', location.href); scene.current.suspended = true; scene.current.hovering = false; setWorld(true); playTone('select', sound); };
  const leaveWorld = (destination: number | null = null) => {
    memoryDestination.current = destination;
    if (history.state?.playbackRoom) history.back();
    else { setWorld(false); scene.current.suspended = false; wake(); setTimeout(() => worldButton.current?.focus({ preventScroll: true }), 60); }
  };
  const openPanel = (next: 'index' | 'about', trigger: HTMLButtonElement) => { panelTrigger.current = trigger; setPanel(next); scene.current.suspended = true; };
  const closePanel = () => { panelDialog.current?.close(); setPanel(null); scene.current.suspended = false; wake(); panelTrigger.current?.focus(); };
  useEffect(() => {
    if (!panel) return;
    panelDialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [panel]);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => { setReduced(query.matches); scene.current.reduced = query.matches; wake(); };
    query.addEventListener('change', listener); return () => query.removeEventListener('change', listener);
  }, []);
  useEffect(() => {
    const onPop = () => {
      const room = history.state?.playbackRoom === true;
      let index = games.findIndex(g => location.hash === `#game/${g.id}`);
      if (!room && memoryDestination.current !== null) { index = memoryDestination.current; memoryDestination.current = null; history.replaceState(null, '', `#game/${games[index].id}`); }
      setWorld(room); scene.current.suspended = room;
      setDetail(index !== -1); scene.current.detail = index !== -1;
      if (index !== -1) setPosition(index);
      resetFlip(); wake();
      if (!room) setTimeout(() => worldButton.current?.focus({ preventScroll: true }), 60);
    };
    window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop);
  }, [setPosition]);
  useEffect(() => { document.title = `${game.title} — PLAY / BACK · Spatial edition`; }, [game.title]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (world || panel || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName)) return;
      if (event.key === 'Escape' && detail) closeDetail();
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      if (event.key.toLowerCase() === 'f' && detail) { event.preventDefault(); flip(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [step, detail, flip, closeDetail, world, panel]);
  useEffect(() => {
    const element = stage.current; if (!element || detail) return;
    let last = 0, sum = 0;
    const wheel = (event: WheelEvent) => { if (event.ctrlKey) return; event.preventDefault(); if (Date.now()-last < 500) return;
      sum += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(sum) > 35) { step(Math.sign(sum)); sum=0; last=Date.now(); }
    };
    element.addEventListener('wheel', wheel, { passive:false }); return () => element.removeEventListener('wheel', wheel);
  }, [step, detail]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { down:true, moved:false, x:event.clientX, y:event.clientY, previousX:event.clientX, time:performance.now(), velocity:0, position:scene.current.position };
    scene.current.dragging=true; event.currentTarget.dataset.dragging='true';
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect=event.currentTarget.getBoundingClientRect(); const x=event.clientX-rect.left, y=event.clientY-rect.top;
    scene.current.pointerX=(x/rect.width-.5)*2; scene.current.pointerY=(y/rect.height-.5)*2;
    event.currentTarget.style.setProperty('--pointer-x', `${(x/rect.width-.5)*18}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${(y/rect.height-.5)*18}%`);
    scene.current.hovering = true; event.currentTarget.dataset.pointer='true';
    if(cursor.current) cursor.current.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(drag.current.down) {
      const delta=event.clientX-drag.current.x, now=performance.now();
      drag.current.velocity=(event.clientX-drag.current.previousX)/Math.max(8,now-drag.current.time);
      drag.current.previousX=event.clientX; drag.current.time=now;
      if(Math.abs(delta)>7 || Math.abs(event.clientY-drag.current.y)>7) drag.current.moved=true;
      if(!detail) scene.current.position=drag.current.position-delta/pixelsPerDisc(rect);
      else scene.current.pointerX=Math.max(-2,Math.min(2,delta/100));
    }
    wake();
  };
  const release = (event: React.PointerEvent<HTMLDivElement>, cancelled=false) => {
    if(!drag.current.down) return;
    drag.current.down=false; scene.current.dragging=false; event.currentTarget.dataset.dragging='false';
    if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if(cancelled) { setPosition(Math.round(scene.current.position)); return; }
    if(drag.current.moved) { if(!detail) { const velocity=performance.now()-drag.current.time<100?drag.current.velocity:0; setPosition(Math.round(scene.current.position-Math.max(-.65,Math.min(.65,velocity*.3)))); playTone('move',sound); } }
    else if(detail) flip();
    else { const r=event.currentTarget.getBoundingClientRect(); const distance=event.clientX-r.left-r.width/2; const spacing=pixelsPerDisc(r); if(Math.abs(distance)<spacing*.4) openGame(); else step(Math.sign(distance)); }
    if (!drag.current.down) {
      event.currentTarget.style.setProperty('--pointer-x', '0%');
      event.currentTarget.style.setProperty('--pointer-y', '0%');
    }
    wake();
  };

  return <div className={`spatial-app ${detail?'is-detail':''} ${night?'is-night':''} ${ready?'is-ready':''}`} style={{ '--game-color': game.color } as CSSProperties} aria-busy={!ready}>
    {!ready && <div className="startup-loading" role="status" aria-live="polite" aria-label="Loading the PLAY / BACK spatial exhibition"><div className="startup-loading__content" aria-hidden="true"><span className="startup-loading__disc"/><span className="startup-loading__name">PLAY / BACK</span><span className="startup-loading__label">LOADING THE SPATIAL EXHIBITION</span></div></div>}
    <a className="skip-link" href="#artifact-controls">Skip to artifact controls</a>
    <div className="atmosphere" aria-hidden="true"><img key={game.id} src={media[game.id][0].src} alt=""/><div/></div>
    <header className="site-header">
      <button className="brand" aria-label="PLAY BACK collection" onClick={closeDetail}><span className="brand-disc"/><span>PLAY / BACK<sup>®</sup></span></button>
      <span className="header-center">AN EXHIBITION OF PLAY<span>1995 — 2000</span></span>
      <nav aria-label="Main navigation"><button onClick={e=>openPanel('index',e.currentTarget)}><Grid2X2 size={14}/><span>Collection</span><sup>{String(games.length).padStart(2, '0')}</sup></button><button onClick={e=>openPanel('about',e.currentTarget)}>About</button><button className="sound-button" aria-label={sound?'Turn sound off':'Turn sound on'} aria-pressed={sound} onClick={()=>{setSound(!sound);playTone('select',!sound);}}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button></nav>
    </header>
    <main className="exhibition" aria-label="Interactive PlayStation disc collection">
      <div className="exhibit-note"><span className="live-dot"/>{detail?'THE ARTIFACT, UP CLOSE':'SMALL DISCS. ENTIRE WORLDS.'}</div>
      <div className="exhibit-number" aria-hidden="true"><span>{number(active)}</span><i>/ {String(games.length).padStart(2, '0')}</i></div>
      {detail && <button ref={closeButton} className="back-button" onClick={closeDetail}><ArrowLeft size={15}/> Back to the collection</button>}
      <div className="gallery-stage" ref={stage} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={e=>release(e)} onPointerCancel={e=>release(e,true)} onPointerLeave={e=>{e.currentTarget.dataset.pointer='false';scene.current.hovering=false;if(!drag.current.down){scene.current.pointerX=0;scene.current.pointerY=0;e.currentTarget.style.setProperty('--pointer-x','0%');e.currentTarget.style.setProperty('--pointer-y','0%');}wake();}}>
        {!fallback && <Suspense fallback={null}><DiscScene state={scene} onReady={onReady} onError={onError}/></Suspense>}
        {(!ready||fallback) && <div className={`fallback-scene ${detail?'fallback-detail':''}`}>{[-1,0,1].map(offset=><div className={`fallback-disc offset-${offset}`} key={`${active}-${offset}`}>{flipped&&offset===0?<div className="fallback-reverse"/>:<img src={discPath(games[wrap(active+offset)])} alt=""/>}</div>)}</div>}
        <div className="disc-cursor" ref={cursor}><span>{detail?'TURN':'INSPECT'}<Plus size={12}/></span><i><MoveHorizontal size={20}/></i></div>
      </div>
      <div className="object-annotation" aria-hidden="true"><span className="annotation-line"/><span>Ø 120 MM<br/>A WORLD YOU COULD HOLD.</span></div>
      <button className="light-switch" onClick={()=>{setNight(!night);scene.current.night=!night;wake();}} aria-label={night?'Switch to studio lighting':'Switch to after-hours lighting'} aria-pressed={night}>{night?<Moon size={15}/>:<Sun size={15}/>}<span>{night?'AFTER HOURS':'STUDIO LIGHT'}<small>CHANGE THE ATMOSPHERE</small></span><i/></button>
      {!detail ? <>
        <section id="artifact-controls" className="artifact-caption" tabIndex={-1} aria-live="polite"><div className="artifact-id"><span>{game.year}</span><i/>{game.developer}<span className="catalog-id">{game.serial}</span></div><h1 key={game.id}>{game.title}</h1><div className="artifact-actions"><button ref={inspectButton} className="inspect-action" onClick={()=>openGame()}>Inspect the disc<ArrowUpRight size={15}/></button><button ref={worldButton} className="world-action" onClick={enterWorld}><Play size={11} fill="currentColor"/>Enter its world</button></div></section>
        <div className="browse-controls"><span><MoveHorizontal size={15}/> DRAG TO DISCOVER</span><div><button aria-label="Previous game" onClick={()=>step(-1)}><ArrowLeft size={20}/></button><button aria-label="Next game" onClick={()=>step(1)}><ArrowRight size={20}/></button></div></div>
      </> : <>
        <section id="artifact-controls" className="detail-copy" key={game.id} tabIndex={-1} aria-label={`About ${game.title}`}><span className="detail-serial">{game.region}<i/>{game.serial}</span><h1>{game.title}</h1><p>{game.description}</p><dl><div><dt>RELEASE</dt><dd>{game.year}</dd></div><div><dt>STUDIO</dt><dd>{game.developer}</dd></div><div><dt>GENRE</dt><dd>{game.genre}</dd></div></dl><button ref={worldButton} className="world-preview" onClick={enterWorld}><img src={media[game.id][0].src} alt=""/><span><Play size={18} fill="currentColor"/>Enter its world<ArrowUpRight size={18}/></span></button><span className="preview-caption">ORIGINAL CAPTURES & ARCHIVAL FILMS</span></section>
        <div className="inspection-controls"><button className="flip-button" aria-pressed={flipped} onClick={flip}><RotateCw size={16}/>{flipped?'Show the artwork':'Turn it over'}<kbd>F</kbd></button><span>{flipped?'THE BLACK DISC. YOU REMEMBER.':'MOVE TO CATCH THE LIGHT'}</span></div>
      </>}
    </main>
    <footer className="collection-footer"><span className="footer-note">{ready?'PHYSICAL MEDIA. LASTING MEMORIES.':'TAKING THE DISCS OFF THE SHELF…'}</span><div className="disc-dock" aria-label="Choose a game">{games.map((item,index)=><button key={item.id} className={active===index?'active':''} onClick={()=>navigate(index)} aria-label={`Select ${item.title}`} aria-pressed={active===index}><img src={discPath(item)} alt=""/><span>{number(index)}</span><span className="dock-label" aria-hidden="true">{item.title}</span></button>)}</div><span className="footer-end">HANDLE WITH MEMORIES.<Aperture size={16}/></span></footer>
    {world && <Suspense fallback={<div className="world-loading">Opening the memory room…</div>}><MemoryViewer key={game.id} game={game} nextGame={games[wrap(active+1)]} reduced={reduced} onClose={() => leaveWorld()} onNext={() => leaveWorld(wrap(active+1))}/></Suspense>}
    {panel && <dialog ref={panelDialog} className="archive-panel" onCancel={e=>{e.preventDefault();closePanel();}} aria-labelledby="panel-title"><div className="panel-top"><span>PLAY / BACK — SPATIAL EDITION</span><button aria-label="Close panel" onClick={closePanel}><X size={22}/></button></div>{panel==='index'?<><h2 id="panel-title">{games.length === 11 ? 'Eleven' : games.length} discs.<br/>Countless memories.</h2><div className="artifact-index">{games.map((item,index)=><button key={item.id} onClick={()=>{closePanel();openGame(index);}}><span>{number(index)}</span><img src={discPath(item)} alt=""/><span>{item.title}<small>{item.developer} / {item.year}</small></span><ArrowUpRight size={20}/></button>)}</div></>:<><h2 id="panel-title">You can still<br/>feel it.</h2><div className="about-art" aria-hidden="true"><img src={discPath(games[4])} alt=""/><img src={discPath(games[0])} alt=""/><img src={discPath(games[1])} alt=""/></div><div className="about-copy"><p>The click of a jewel case. The black underside of a disc. That sound when it all began.</p><p>PLAY / BACK is an independent celebration of the original PlayStation — and the small, physical objects that carried entire worlds.</p><p className="credits">A fan-made exhibition, not affiliated with Sony Interactive Entertainment. Game artwork and trademarks belong to their respective owners. Disc scans and original gameplay captures are sourced from <a href="https://psxdatacenter.com/" target="_blank" rel="noreferrer">PSX Data Center</a>. No games or downloads are provided.</p></div></>}</dialog>}
  </div>;
}
