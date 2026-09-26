import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight, Plus, RotateCw, Volume2, VolumeX, X, MoveHorizontal, Disc3, Grid2X2 } from 'lucide-react';
import { discPath, games, number, wrap } from './data';
import { playTone } from './audio';
import type { SceneState } from './DiscScene';

const DiscScene = lazy(() => import('./DiscScene'));
type View = 'collection' | 'index' | 'about';
const wake = () => window.dispatchEvent(new Event('playback:render'));
const initialGame = () => Math.max(0, games.findIndex(g => location.hash === `#game/${g.id}`));

function Symbols() {
  return <svg className="symbols" width="87" height="16" viewBox="0 0 87 16" fill="none" aria-label="Triangle, circle, cross, square">
    <path d="M8 2 15 14H1L8 2Z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="31" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="m49 2 12 12m0-12L49 14" stroke="currentColor" strokeWidth="1.3" />
    <path d="M74 2h12v12H74z" stroke="currentColor" strokeWidth="1.3" />
  </svg>;
}

export default function App() {
  const [view, setView] = useState<View>(location.hash === '#index' ? 'index' : location.hash === '#about' ? 'about' : 'collection');
  const [detail, setDetail] = useState(location.hash.startsWith('#game/'));
  const [active, setActive] = useState(location.hash.startsWith('#game/') ? initialGame() : 1);
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [sound, setSound] = useState(() => { try { return localStorage.getItem('playback-sound') === 'true'; } catch { return false; } });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scene = useRef<SceneState>({ position: active, detail, flipped: false, pointerX: 0, pointerY: 0, dragging: false, reduced });
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const inspectButton = useRef<HTMLButtonElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const drag = useRef({ down: false, moved: false, x: 0, y: 0, previousX: 0, time: 0, velocity: 0, position: 0 });
  const game = games[active];
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setFallback(true); setReady(true); }, []);

  const setPosition = useCallback((position: number) => {
    scene.current.position = position;
    setActive(wrap(Math.round(position)));
    wake();
  }, []);
  const navigate = useCallback((index: number) => {
    const current = Math.round(scene.current.position);
    let delta = wrap(index - wrap(current));
    if (delta > games.length / 2) delta -= games.length;
    setPosition(current + delta); setFlipped(false); scene.current.flipped = false;
    playTone('move', sound); wake();
  }, [setPosition, sound]);
  const step = useCallback((direction: number) => {
    setPosition(Math.round(scene.current.position) + direction);
    setFlipped(false); scene.current.flipped = false; playTone('move', sound);
    if (scene.current.detail) history.replaceState(null, '', `#game/${games[wrap(Math.round(scene.current.position))].id}`);
    wake();
  }, [setPosition, sound]);
  const openGame = useCallback((index = active) => {
    navigate(index); setView('collection'); setDetail(true); scene.current.detail = true;
    history.pushState(null, '', `#game/${games[index].id}`);
    playTone('select', sound); wake();
    setTimeout(() => closeButton.current?.focus({ preventScroll: true }), 80);
  }, [active, navigate, sound]);
  const closeDetail = useCallback(() => {
    setDetail(false); setFlipped(false); scene.current.detail = false; scene.current.flipped = false;
    history.pushState(null, '', '#collection'); wake();
    setTimeout(() => inspectButton.current?.focus({ preventScroll: true }), 80);
  }, []);
  const changeView = useCallback((next: View) => {
    setView(next); setDetail(false); setFlipped(false); scene.current.detail = false; scene.current.flipped = false;
    history.pushState(null, '', `#${next}`); playTone('select', sound); wake();
    setTimeout(() => pageHeading.current?.focus({ preventScroll: true }), 80);
  }, [sound]);
  const flip = useCallback(() => {
    setFlipped(value => { scene.current.flipped = !value; return !value; });
    playTone('flip', sound); wake();
  }, [sound]);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => { setReduced(media.matches); scene.current.reduced = media.matches; wake(); };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  useEffect(() => {
    const onPop = () => {
      const hash = location.hash;
      const id = games.findIndex(g => hash === `#game/${g.id}`);
      const isDetail = id !== -1;
      setView(hash === '#index' ? 'index' : hash === '#about' ? 'about' : 'collection');
      setDetail(isDetail); scene.current.detail = isDetail;
      if (isDetail) setPosition(id);
      setFlipped(false); scene.current.flipped = false; wake();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setPosition]);
  useEffect(() => {
    document.title = detail ? `${game.title} — PLAY / BACK` : view === 'about' ? 'The story — PLAY / BACK' : view === 'index' ? 'Collection index — PLAY / BACK' : 'PLAY / BACK — A PlayStation Disc Archive';
  }, [detail, game.title, view]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName)) return;
      if (event.key === 'Escape') { if (detail) closeDetail(); else if (view !== 'collection') changeView('collection'); }
      if (view !== 'collection') return;
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      if (event.key.toLowerCase() === 'f' && detail) { event.preventDefault(); flip(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [step, view, detail, flip, closeDetail, changeView]);
  useEffect(() => {
    const element = stage.current;
    if (!element || view !== 'collection' || detail) return;
    let lastWheel = 0, sum = 0;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      if (Date.now() - lastWheel < 460) return;
      sum += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(sum) > 35) { step(Math.sign(sum)); sum = 0; lastWheel = Date.now(); }
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [step, view, detail]);
  useEffect(() => { try { localStorage.setItem('playback-sound', String(sound)); } catch { /* Preference storage is optional. */ } }, [sound]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    drag.current = { down: true, moved: false, x: event.clientX, y: event.clientY, previousX: event.clientX, time: performance.now(), velocity: 0, position: scene.current.position };
    scene.current.dragging = true; element.dataset.dragging = 'true';
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    scene.current.pointerX = (x / rect.width - .5) * 2;
    scene.current.pointerY = (y / rect.height - .5) * 2;
    if (cursor.current) cursor.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (drag.current.down) {
      const delta = event.clientX - drag.current.x;
      const now = performance.now();
      drag.current.velocity = (event.clientX - drag.current.previousX) / Math.max(8, now - drag.current.time);
      drag.current.previousX = event.clientX; drag.current.time = now;
      if (Math.abs(delta) > 7 || Math.abs(event.clientY - drag.current.y) > 7) drag.current.moved = true;
      if (!detail) {
        const pixelsPerDisc = rect.height * 6.8 / (rect.width < 700 ? 7.7 : 7.2);
        scene.current.position = drag.current.position - delta / pixelsPerDisc;
      } else {
        scene.current.pointerX = Math.max(-2, Math.min(2, delta / 100));
      }
    }
    wake();
  };
  const release = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (!drag.current.down) return;
    drag.current.down = false; scene.current.dragging = false; event.currentTarget.dataset.dragging = 'false';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) { setPosition(Math.round(scene.current.position)); return; }
    if (drag.current.moved) {
      if (!detail) {
        const recentVelocity = performance.now() - drag.current.time < 100 ? drag.current.velocity : 0;
        setPosition(Math.round(scene.current.position - Math.max(-.65, Math.min(.65, recentVelocity * .3))));
        playTone('move', sound);
      }
    } else if (detail) flip();
    else {
      const rect = event.currentTarget.getBoundingClientRect();
      const fromCenter = event.clientX - rect.left - rect.width / 2;
      const pixelsPerDisc = rect.height * 6.8 / (rect.width < 700 ? 7.7 : 7.2);
      if (Math.abs(fromCenter) < pixelsPerDisc * .47) openGame();
      else step(Math.sign(fromCenter));
    }
    wake();
  };

  return <div className={`app view-${view} ${detail ? 'is-detail' : ''} ${ready ? 'is-ready' : ''} ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#main">Skip to collection</a>
    <header className="site-header">
      <button className="brand" aria-label="PLAY BACK home" onClick={() => changeView('collection')}>
        <span className="brand-disc"><span /></span><span>PLAY<span className="brand-slash">/</span>BACK<span className="brand-trademark">®</span></span>
      </button>
      <div className="header-caption">AN ORIGINAL PLAYSTATION ARCHIVE</div>
      <nav aria-label="Main navigation">
        <button className={view === 'collection' ? 'nav-link active' : 'nav-link'} aria-current={view === 'collection' ? 'page' : undefined} onClick={() => changeView('collection')}>Collection<span className="nav-count">06</span></button>
        <button className={view === 'index' ? 'nav-link active' : 'nav-link'} aria-current={view === 'index' ? 'page' : undefined} onClick={() => changeView('index')}>Index</button>
        <button className={view === 'about' ? 'nav-link active' : 'nav-link'} aria-current={view === 'about' ? 'page' : undefined} onClick={() => changeView('about')}>About<ArrowUpRight size={12}/></button>
      </nav>
      <button className={`sound-button ${sound ? 'sound-on' : ''}`} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} aria-pressed={sound} onClick={() => { setSound(!sound); playTone('select', !sound); }}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>SOUND {sound ? 'ON' : 'OFF'}</span></button>
    </header>

    <main id="main" className="main" tabIndex={-1}>
      {view === 'collection' && <>
        <div className="hero-copy" aria-hidden={detail} inert={detail}>
          <div className="hero-title-wrap"><h1 ref={pageHeading} tabIndex={-1}>PLAY<span className="title-slash">/</span>BACK<span className="title-star">®</span></h1><span className="title-caption">SMALL DISCS. ENTIRE WORLDS.</span></div>
          <div className="hero-aside"><span className="edition"><i/> THE FIRST GENERATION, REVISITED</span><p>Before everything was a download,<br/>it was something you could hold.</p><span className="hero-years">1995—1998 <span>VOL. 01</span></span></div>
        </div>
        {detail && <div className="detail-topline"><button ref={closeButton} className="text-button" onClick={closeDetail}><ArrowLeft size={16}/> Back to collection</button><span>ARTIFACT {number(active)} / 06</span><button className="icon-button detail-x" onClick={closeDetail} aria-label="Close inspection"><X size={20}/></button></div>}

        <div className="gallery-stage" ref={stage} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={event => release(event)} onPointerCancel={event => release(event, true)} onPointerLeave={() => { if (!drag.current.down) { scene.current.pointerX = 0; scene.current.pointerY = 0; wake(); } }} aria-label={`${game.title} disc. Drag to browse; use the controls below for keyboard access.`}>
          {!fallback && <Suspense fallback={null}><DiscScene state={scene} onReady={onReady} onError={onError}/></Suspense>}
          {(!ready || fallback) && <div className={`fallback-scene ${detail ? 'fallback-detail' : ''}`}>
            {[-1, 0, 1].map(offset => <div className={`fallback-disc offset-${offset} ${flipped && offset === 0 ? 'flipped' : ''}`} key={`${active}-${offset}`}>
              {flipped && offset === 0 ? <div className="fallback-reverse"/> : <img src={discPath(games[wrap(active + offset)])} alt=""/>}
            </div>)}
          </div>}
          <div className="stage-marker stage-marker-left"><Plus size={13}/><span>{detail ? 'PHYSICAL MEDIA / CD-ROM' : 'SIX OBJECTS. COUNTLESS MEMORIES.'}</span></div>
          {!detail && <div className="stage-marker stage-marker-right"><span>PICK ONE UP</span><ArrowUpRight size={13}/></div>}
          <div ref={cursor} className="disc-cursor"><span className="cursor-rest">{detail ? 'TURN' : 'PICK UP'}<ArrowUpRight size={15}/></span><span className="cursor-drag"><MoveHorizontal size={22}/></span></div>
          {!detail && <div className="gallery-side-label left" aria-hidden="true">{games[wrap(active-1)].short}<span>{games[wrap(active-1)].year}</span></div>}
          {!detail && <div className="gallery-side-label right" aria-hidden="true">{games[wrap(active+1)].short}<span>{games[wrap(active+1)].year}</span></div>}
        </div>

        {detail ? <>
          <section className="detail-copy" aria-label={`About ${game.title}`} key={game.id}>
            <div className="detail-title-row"><span className="catalog-tag">{game.year}</span><span>{game.genre}</span></div>
            <h1>{game.title}</h1>
            <p className="detail-quote">{game.quote}</p>
            <p className="detail-description">{game.description}</p>
            <dl className="metadata"><div><dt>DEVELOPER</dt><dd>{game.developer}</dd></div><div><dt>EDITION ON DISPLAY</dt><dd>{game.region}</dd></div><div><dt>CATALOG NO.</dt><dd>{game.serial}</dd></div><div><dt>FORMAT</dt><dd>PlayStation CD-ROM</dd></div></dl>
            <p className="memory"><span>IN THE MEMORY CARD</span>{game.memory}</p>
          </section>
          <div className="inspection-controls"><button className={`flip-button ${flipped ? 'is-flipped' : ''}`} onClick={flip} aria-pressed={flipped}><RotateCw size={16}/>{flipped ? 'Show artwork' : 'Turn it over'}<kbd>F</kbd></button><span>{flipped ? 'THE BLACK DISC. YOU REMEMBER.' : 'MOVE TO CATCH THE LIGHT'}</span></div>
          <div className="detail-bottom"><span>HANDLE WITH MEMORIES.</span><button className="next-artifact" onClick={() => step(1)}>Next artifact <strong>{games[wrap(active+1)].short}</strong><ArrowRight size={18}/></button></div>
        </> : <>
          <section className="selection-bar" aria-label="Selected game">
            <div className="browse-hint"><MoveHorizontal size={19}/><span>DRAG TO EXPLORE<br/><span>OR USE YOUR ARROW KEYS</span></span></div>
            <div className="selected-game" aria-live="polite" aria-atomic="true" key={game.id}><div className="selected-meta"><span className="catalog-tag">{number(active)} / 06</span><span>{game.year}</span><span className="meta-dot"/>{game.developer}</div><h2>{game.title}</h2><button className="inspect-button" ref={inspectButton} onClick={() => openGame()}>Explore the artifact<ArrowUpRight size={15}/></button></div>
            <div className="carousel-arrows"><button className="arrow-button" onClick={() => step(-1)} aria-label="Previous game"><ArrowLeft size={21}/></button><button className="arrow-button" onClick={() => step(1)} aria-label="Next game"><ArrowRight size={21}/></button></div>
          </section>
          <div className="collection-rail" aria-label="Choose a game">{games.map((item, i) => <button key={item.id} className={`rail-item ${active === i ? 'selected' : ''}`} aria-label={`Select ${item.title}`} aria-pressed={active === i} onClick={() => navigate(i)}><span>{number(i)}</span><span className="rail-name">{item.short}</span><span className="rail-mark"/></button>)}</div>
        </>}
      </>}

      {view === 'index' && <section className="index-view">
        <div className="section-heading"><h1 ref={pageHeading} tabIndex={-1}>THE COLLECTION<span>(06)</span></h1><p>A few discs that changed everything.<br/>Every one worth another look.</p></div>
        <div className="index-table"><div className="index-table-head"><span>ARTIFACT</span><span>TITLE</span><span>STUDIO</span><span>YEAR</span><span/></div>
          {games.map((item, i) => <button className="index-row" key={item.id} onClick={() => openGame(i)}><span className="index-number">{number(i)}<img src={discPath(item)} alt="" loading="eager"/></span><span className="index-title">{item.title}<span>{item.genre}</span></span><span className="index-studio">{item.developer}</span><span className="index-year">{item.year}</span><ArrowUpRight size={24}/></button>)}
        </div><div className="index-bottom"><Symbols/><span>THE ORIGINALS NEVER GET OLD.</span><button className="text-button" onClick={() => changeView('collection')}><Disc3 size={16}/> Back to the discs</button></div>
      </section>}

      {view === 'about' && <section className="about-view">
        <div className="about-top"><span>A LOVE LETTER TO PHYSICAL PLAY.</span><Symbols/></div>
        <h1 ref={pageHeading} tabIndex={-1}>YOU HAD<br/>TO BE <span>THERE.</span></h1>
        <div className="about-content"><div className="about-disc"><span className="about-disc-label">PLAY / BACK<br/><small>MEMORY NEVER EXPIRES.</small></span><span className="about-hole"/><span className="about-disc-bottom">1994 — FOREVER</span></div><div className="about-story"><p className="about-lead">The click of a jewel case.<br/>The black underside of a disc.<br/>That sound when it all began.</p><p>Before instant libraries and endless updates, a whole world fit in the palm of your hand. You knew the scratches on your favourite disc. You knew which friend still had it.</p><p>PLAY / BACK is a small, independent celebration of that feeling. Six games from the original PlayStation era, remembered through the objects that carried them.</p><button className="about-cta" onClick={() => changeView('collection')}>Make a little time for the past.<ArrowUpRight size={25}/></button></div></div>
        <div className="credits"><div><span>AN INDEPENDENT EXHIBITION</span><p>A fan-made archival tribute. Not affiliated with Sony Interactive Entertainment. All game artwork and trademarks belong to their respective owners.</p></div><div><span>ARTWORK & ARCHIVE</span><p>Disc scans courtesy of the <a href="https://psxdatacenter.com/" target="_blank" rel="noreferrer">PSX Data Center<ArrowUpRight size={12}/></a>. Displayed as historical artifacts; no games or downloads are provided.</p></div><button className="text-button" onClick={() => changeView('index')}>View all six artifacts<Grid2X2 size={16}/></button></div>
      </section>}
    </main>

    <footer className="site-footer"><span><i className="status-dot"/>{!ready && view === 'collection' ? 'TAKING THE DISCS OFF THE SHELF' : 'A LOVE LETTER TO THE ORIGINAL PLAYSTATION'}</span><span className="footer-center">EST. 1994 <span>—</span> NEVER FORGOTTEN</span><Symbols/></footer>
  </div>;
}
