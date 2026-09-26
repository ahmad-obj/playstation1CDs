import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { discPath, games } from './data';

export interface SceneState { position: number; detail: boolean; flipped: boolean; pointerX: number; pointerY: number; dragging: boolean; reduced: boolean; }
interface Props { state: React.RefObject<SceneState>; onReady: () => void; onError: () => void; }

const radius = 2.8;
const spacing = 6.8;

function ring(inner: number, outer: number) {
  const geometry = new THREE.RingGeometry(inner, outer, 192);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) uv.setXY(i, position.getX(i) / (radius * 2) + .5, position.getY(i) / (radius * 2) + .5);
  return geometry;
}

function reverseMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { light: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vView = -mv.xyz;
      vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `precision highp float; varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; uniform vec2 light;
      void main() {
        vec2 p = (vUv - .5) * 2.; float r = length(p); float angle = atan(p.y, p.x);
        vec3 n = normalize(vNormal); vec3 v = normalize(vView);
        float facing = abs(dot(n, v));
        float sweep = pow(abs(cos(angle - light.x * .5 + .7)), 22.);
        vec3 spectrum = .5 + .5 * cos(6.28318 * (vec3(0., .33, .67) + r * .85 + angle * .14 + light.y * .15));
        float rings = sin(r * 2800.) * .008;
        float sheen = pow(abs(sin(angle + light.x * .3)), 14.);
        vec3 color = vec3(.022, .019, .035) + spectrum * sweep * (.19 + (1. - facing) * .3);
        color += vec3(.19, .17, .24) * sheen * .32 + rings;
        color += pow(1. - facing, 3.) * .12;
        gl_FragColor = vec4(color, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export default function DiscScene({ state, onReady, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { onError(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-10, 10, 3.8, -3.8, .1, 80);
    camera.position.set(0, 0, 15);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-3, 6, 10); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdce4ff, 1.3);
    fill.position.set(6, -2, 5); scene.add(fill);

    const faceGeometry = ring(.43, radius - .015);
    const backGeometry = ring(.43, radius - .008);
    const hubGeometry = ring(.355, .46);
    const edgeGeometry = new THREE.CylinderGeometry(radius, radius, .037, 192, 1, true);
    edgeGeometry.rotateX(Math.PI / 2);
    const hubEdgeGeometry = new THREE.CylinderGeometry(.355, .355, .045, 96, 1, true);
    hubEdgeGeometry.rotateX(Math.PI / 2);
    const edgeMaterial = new THREE.MeshPhysicalMaterial({ color: '#39333d', roughness: .19, metalness: .75, clearcoat: 1, iridescence: .6, iridescenceIOR: 1.3 });
    const hubMaterial = new THREE.MeshPhysicalMaterial({ color: '#bdbbbb', metalness: .78, roughness: .15, clearcoat: 1, side: THREE.DoubleSide });
    const backMaterial = reverseMaterial();
    const sheenGeometry = ring(.47, radius - .035);
    const sheenMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .55, roughness: .26, transparent: true, opacity: .055, depthWrite: false, iridescence: .8 });
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const materials: THREE.Material[] = [];
    let disposed = false;
    let loaded = 0;
    const discs = games.map((game, i) => {
      const group = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: '#e2e0d7', roughness: .57, metalness: .07, envMapIntensity: .45 });
      materials.push(material);
      loader.load(discPath(game), texture => {
        if (disposed) { texture.dispose(); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        textures.push(texture);
        material.map = texture; material.color.set('#ffffff'); material.needsUpdate = true;
        loaded++; if (loaded === games.length) onReady();
        invalidate();
      }, undefined, () => { if (!disposed) onError(); });
      const front = new THREE.Mesh(faceGeometry, material); front.position.z = .024;
      const back = new THREE.Mesh(backGeometry, backMaterial); back.rotation.y = Math.PI; back.position.z = -.023;
      const sheen = new THREE.Mesh(sheenGeometry, sheenMaterial); sheen.position.z = .026;
      const hub = new THREE.Mesh(hubGeometry, hubMaterial); hub.position.z = .025;
      const rearHub = new THREE.Mesh(hubGeometry, hubMaterial); rearHub.position.z = -.025;
      const rim = new THREE.Mesh(edgeGeometry, edgeMaterial);
      const hole = new THREE.Mesh(hubEdgeGeometry, hubMaterial);
      group.add(front, back, sheen, hub, rearHub, rim, hole);
      group.position.x = (i - state.current.position) * spacing;
      scene.add(group);
      return group;
    });

    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 256; shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d')!;
    const gradient = context.createRadialGradient(128, 64, 0, 128, 64, 64);
    gradient.addColorStop(0, 'rgba(35,33,25,.26)'); gradient.addColorStop(.4, 'rgba(35,33,25,.15)'); gradient.addColorStop(1, 'rgba(35,33,25,0)');
    context.scale(2, 1); context.fillStyle = gradient; context.fillRect(0, 0, 256, 128);
    // Elliptical soft shadows live behind the objects, in the same scene.
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(6.8, 1.1);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .55 });
    const shadows = discs.map(() => { const mesh = new THREE.Mesh(shadowGeometry, shadowMaterial); mesh.position.set(0, -2.94, -1); scene.add(mesh); return mesh; });

    let width = 1, height = 1, halfWidth = 8;
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      if (!width || !height) return;
      const halfHeight = width < 700 ? 3.85 : 3.6;
      halfWidth = halfHeight * width / height;
      camera.left = -halfWidth; camera.right = halfWidth; camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix(); renderer.setSize(width, height); invalidate();
    };
    let frame = 0;
    let renderedPosition = state.current.position;
    let detail = 0, flip = 0, px = 0, py = 0;
    let last = 0;
    let settleFrames = 0;
    let previousState = '';
    const render = (time: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const s = state.current;
      const dt = Math.min((time - last) / 1000 || .016, .05); last = time;
      const easing = s.reduced ? 1 : 1 - Math.exp(-dt * (s.dragging ? 22 : 9));
      const velocity = s.position - renderedPosition;
      renderedPosition += velocity * easing;
      detail += ((s.detail ? 1 : 0) - detail) * easing;
      flip += ((s.flipped ? Math.PI : 0) - flip) * (s.reduced ? 1 : 1 - Math.exp(-dt * 6.5));
      px += (s.pointerX - px) * easing; py += (s.pointerY - py) * easing;
      const mobile = width < 700;
      discs.forEach((disc, i) => {
        let distance = ((i - renderedPosition + 15) % games.length + games.length) % games.length - 3;
        // Every physical object keeps its cyclic position through the strip.
        if (distance > 3) distance -= games.length;
        const focus = Math.max(0, 1 - Math.abs(distance));
        const selected = Math.abs(distance) < .5;
        const extra = detail * (selected ? 0 : Math.sign(distance) * 9);
        disc.position.x = distance * spacing + extra - detail * (mobile ? 0 : halfWidth * .40);
        disc.position.y = .14 + focus * .06 + detail * (mobile ? .15 : .05);
        disc.position.z = focus * .5;
        const scale = 1 + focus * .025 + detail * (mobile ? -.05 : .12);
        disc.scale.setScalar(scale);
        disc.rotation.x = .12 + (s.reduced ? 0 : py * .09 * focus);
        disc.rotation.y = distance * -.19 + (s.reduced ? 0 : px * .12 * focus) + (selected ? flip : 0);
        disc.rotation.z = -.07 + distance * -.055 + (s.reduced ? 0 : velocity * -.065) + detail * .07;
        disc.visible = Math.abs(disc.position.x) < halfWidth + 4;
        shadows[i].position.x = disc.position.x;
        shadows[i].scale.x = scale;
        shadows[i].visible = disc.visible;
      });
      backMaterial.uniforms.light.value.set(px, py);
      key.position.x = -3 + px * 3; key.position.y = 6 - py * 3;
      renderer.render(scene, camera);
      const signature = [s.position,s.detail,s.flipped,s.pointerX,s.pointerY,s.dragging,s.reduced].join(',');
      if (signature !== previousState || Math.abs(velocity) > .0001 || Math.abs((s.detail ? 1 : 0) - detail) > .0001 || Math.abs((s.flipped ? Math.PI : 0) - flip) > .0001 || Math.abs(s.pointerX-px) > .0001 || Math.abs(s.pointerY-py) > .0001) settleFrames = 0;
      else settleFrames++;
      previousState = signature;
      if (settleFrames < 5) frame = requestAnimationFrame(render);
    };
    function invalidate() { settleFrames = 0; if (!frame && !disposed) frame = requestAnimationFrame(render); }
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const wake = () => invalidate();
    window.addEventListener('playback:render', wake);
    document.addEventListener('visibilitychange', wake);
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('playback:render', wake); document.removeEventListener('visibilitychange', wake);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      [faceGeometry, backGeometry, hubGeometry, edgeGeometry, hubEdgeGeometry, sheenGeometry, shadowGeometry].forEach(g => g.dispose());
      [...materials, edgeMaterial, hubMaterial, backMaterial, sheenMaterial, shadowMaterial].forEach(m => m.dispose());
      textures.forEach(t => t.dispose()); shadowTexture.dispose(); environment.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [state, onReady, onError]);
  return <div className="disc-canvas" ref={host} aria-hidden="true" />;
}
