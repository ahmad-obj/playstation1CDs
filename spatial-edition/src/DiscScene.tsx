import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { discPath, games, wrap } from './data';

export interface SceneState { position: number; detail: boolean; flipped: boolean; pointerX: number; pointerY: number; dragging: boolean; reduced: boolean; hovering: boolean; suspended: boolean; night: boolean; }
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
        float rings = sin(r * 1600.) * .001 * (1. - smoothstep(.3, 1.5, fwidth(r * 1600.)));
        float sheen = pow(abs(sin(angle + light.x * .3)), 14.);
        vec3 color = vec3(.006, .005, .012) + spectrum * sweep * (.075 + (1. - facing) * .2);
        color += vec3(.19, .17, .24) * sheen * .18 + rings;
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
    renderer.toneMappingExposure = .95;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, .1, 80);
    camera.position.set(0, 0, 14);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose(); pmrem.dispose();
    const ambient = new THREE.AmbientLight(0xffffff, .85);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff8e9, 2.2);
    key.position.set(-3, 6, 10); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdce4ff, .65);
    fill.position.set(6, -2, 5); scene.add(fill);

    const faceGeometry = ring(.43, radius - .015);
    const backGeometry = ring(.43, radius - .008);
    const hubGeometry = ring(.355, .46);
    const rimFaceGeometry = ring(radius - .023, radius);
    const edgeGeometry = new THREE.CylinderGeometry(radius, radius, .037, 192, 1, true);
    edgeGeometry.rotateX(Math.PI / 2);
    const hubEdgeGeometry = new THREE.CylinderGeometry(.355, .355, .045, 96, 1, true);
    hubEdgeGeometry.rotateX(Math.PI / 2);
    const edgeMaterial = new THREE.MeshPhysicalMaterial({ color: '#39333d', roughness: .19, metalness: .75, clearcoat: 1, iridescence: .6, iridescenceIOR: 1.3 });
    const hubMaterial = new THREE.MeshPhysicalMaterial({ color: '#d1d3cf', metalness: .9, roughness: .12, clearcoat: 1, envMapIntensity: 1.25, side: THREE.DoubleSide });
    const backMaterial = reverseMaterial();
    const sheenGeometry = ring(.47, radius - .035);
    const sheenMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .45, roughness: .3, transparent: true, opacity: .045, depthWrite: false, clearcoat: 1, iridescence: .12 });
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const materials: THREE.Material[] = [];
    let disposed = false;
    let loaded = 0;
    const discs = games.map((game, i) => {
      const group = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: '#e2e0d7', roughness: .62, metalness: .02, envMapIntensity: .17 });
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
      const rimFace = new THREE.Mesh(rimFaceGeometry, hubMaterial); rimFace.position.z = .024;
      group.add(front, back, sheen, hub, rearHub, rim, hole, rimFace);
      group.position.x = (i - state.current.position) * spacing;
      scene.add(group);
      return group;
    });

    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 256; shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d')!;
    context.translate(128, 64); context.scale(2, 1);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 64);
    gradient.addColorStop(0, 'rgba(35,33,25,.42)'); gradient.addColorStop(.35, 'rgba(35,33,25,.18)'); gradient.addColorStop(1, 'rgba(35,33,25,0)');
    context.fillStyle = gradient; context.fillRect(-64, -64, 128, 128);
    // Elliptical soft shadows live behind the objects, in the same scene.
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(6.8, 1.1);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .8 });
    const shadows = discs.map(() => { const mesh = new THREE.Mesh(shadowGeometry, shadowMaterial); mesh.position.set(0, -2.94, -1); scene.add(mesh); return mesh; });

    // Ground contours establish a shared plane; the floating label stays above it.
    const contourGeometry = new THREE.RingGeometry(3.1, 3.108, 192);
    const contourMaterial = new THREE.MeshBasicMaterial({ color: '#697255', transparent: true, opacity: .19, side: THREE.DoubleSide, depthWrite: false });
    const groundContours = discs.map(() => {
      const group = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const contour = new THREE.Mesh(contourGeometry, contourMaterial);
        contour.scale.setScalar(1 + j * .13); contour.position.z = -.02 * j;
        group.add(contour);
      }
      group.rotation.x = -1.29; group.position.set(0, -2.6, -.8); scene.add(group); return group;
    });
    const haloGroup = new THREE.Group(); scene.add(haloGroup);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: '#7a845f', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const haloGeometries: THREE.BufferGeometry[] = [];
    for (let j = 0; j < 3; j++) {
      const geometry = new THREE.RingGeometry(3.08 + j * .13, 3.086 + j * .13, 120, 1, j * .8, Math.PI * (j === 1 ? .9 : 1.35));
      haloGeometries.push(geometry); haloGroup.add(new THREE.Mesh(geometry, haloMaterial));
    }
    const tickGeometry = new THREE.PlaneGeometry(.065, .006); haloGeometries.push(tickGeometry);
    for (let j = 0; j < 48; j++) {
      const angle = j / 48 * Math.PI * 2;
      const tick = new THREE.Mesh(tickGeometry, haloMaterial);
      tick.position.set(Math.cos(angle) * 3.48, Math.sin(angle) * 3.48, 0); tick.rotation.z = angle;
      if (j % 4 === 0) tick.scale.x = 2;
      haloGroup.add(tick);
    }

    const fieldGeometry = new THREE.PlaneGeometry(45, 15);
    const fieldMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { tint: { value: new THREE.Color(games[wrap(Math.round(state.current.position))].color) }, pointer: { value: new THREE.Vector2() } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv; uniform vec3 tint; uniform vec2 pointer;
        void main(){vec2 p=(vUv-.5)*vec2(3.,2.);p-=pointer*.035;
        float radius=length(p*vec2(.7,2.3));float falloff=exp(-radius*radius*3.);
        gl_FragColor=vec4(tint,falloff*.17);
        #include <colorspace_fragment>
        }`,
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial); field.position.set(0, -2, -5); scene.add(field);

    let width = 1, height = 1, halfWidth = 8;
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      if (!width || !height) return;
      const compact = width <= 540 || (state.current.detail && width <= 900);
      const halfHeight = compact ? Math.max(3.85, 2.96 * height / (width * .85)) : 3.6;
      halfWidth = halfHeight * width / height;
      camera.aspect = width / height; camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfHeight / 14));
      camera.updateProjectionMatrix(); renderer.setSize(width, height); invalidate();
    };
    let frame = 0;
    let renderedPosition = state.current.position;
    let detail = 0, flip = 0, px = 0, py = 0, hover = 0, night = 0;
    let last = 0;
    let settleFrames = 0;
    let previousState = '';
    const render = (time: number) => {
      frame = 0;
      if (disposed || document.hidden || state.current.suspended) return;
      const s = state.current;
      const dt = Math.min((time - last) / 1000 || .016, .05); last = time;
      const easing = s.reduced ? 1 : 1 - Math.exp(-dt * (s.dragging ? 22 : 9));
      const velocity = s.position - renderedPosition;
      renderedPosition += velocity * easing;
      detail += ((s.detail ? 1 : 0) - detail) * easing;
      flip += ((s.flipped ? Math.PI : 0) - flip) * (s.reduced ? 1 : 1 - Math.exp(-dt * 6.5));
      px += (s.pointerX - px) * easing; py += (s.pointerY - py) * easing;
      hover += ((s.hovering ? 1 : 0) - hover) * easing;
      night += ((s.night ? 1 : 0) - night) * easing;
      contourMaterial.color.setRGB(.29 + night * .35, .34 + night * .34, .28 + night * .35);
      haloMaterial.color.setRGB(.32 + night * .4, .38 + night * .4, .3 + night * .36);
      key.intensity = 2.2 + night * .6; fill.intensity = .65 + night * .4;
      const mobile = width <= 540 || (s.detail && width <= 900);
      const activeIndex = ((Math.round(renderedPosition) % games.length) + games.length) % games.length;
      fieldMaterial.uniforms.tint.value.lerp(new THREE.Color(games[activeIndex].color), easing * .3);
      fieldMaterial.uniforms.pointer.value.set(px, py);
      discs.forEach((disc, i) => {
        let distance = ((i - renderedPosition) % games.length + games.length) % games.length;
        if (distance > games.length / 2) distance -= games.length;
        const focus = Math.max(0, 1 - Math.abs(distance));
        const selected = Math.abs(distance) < .5;
        const extra = detail * (selected ? 0 : Math.sign(distance) * (halfWidth + 10));
        const breathe = s.reduced ? 0 : Math.sin(time * .00065 + i) * .025 * hover;
        disc.position.x = distance * spacing + extra - detail * (mobile ? 0 : halfWidth * .40) + px * focus * .12 * (s.reduced ? 0 : 1);
        disc.position.y = .12 + focus * .14 + detail * (mobile ? .05 : -.06) + breathe + hover * focus * .09;
        disc.position.z = -.7 + focus * 1.35;
        const scale = .98 + focus * .02 + detail * (mobile ? -.08 : .02);
        disc.scale.setScalar(scale);
        disc.rotation.x = .18 + Math.min(Math.abs(distance), 1) * .16 + (s.reduced ? 0 : py * .18 * focus);
        disc.rotation.y = distance * -.38 + (s.reduced ? 0 : px * .24 * focus) + (selected ? flip : 0);
        disc.rotation.z = -.09 + distance * -.085 + (s.reduced ? 0 : velocity * -.13) + detail * .09;
        disc.visible = Math.abs(disc.position.x) < halfWidth + 4 && (detail < .98 || selected);
        shadows[i].position.x = disc.position.x;
        shadows[i].scale.x = scale;
        shadows[i].visible = disc.visible;
        groundContours[i].position.x = disc.position.x;
        groundContours[i].visible = disc.visible;
        groundContours[i].scale.setScalar(1 + focus * hover * .045);
        if (selected) {
          haloGroup.position.copy(disc.position); haloGroup.position.z -= .08;
          haloGroup.rotation.set(disc.rotation.x, disc.rotation.y - flip, disc.rotation.z + (s.reduced ? 0 : time * .000025));
          haloGroup.scale.setScalar(scale * (1 + hover * .018));
        }
      });
      haloMaterial.opacity = (.085 + hover * .31) * (1 - detail * .5);
      backMaterial.uniforms.light.value.set(px, py);
      key.position.x = -3 + px * 3; key.position.y = 6 - py * 3;
      renderer.render(scene, camera);
      const signature = [s.position,s.detail,s.flipped,s.pointerX,s.pointerY,s.dragging,s.reduced,s.hovering,s.night].join(',');
      if ((!s.reduced && s.hovering) || signature !== previousState || Math.abs(velocity) > .0001 || Math.abs((s.detail ? 1 : 0) - detail) > .0001 || Math.abs((s.flipped ? Math.PI : 0) - flip) > .0001 || Math.abs(s.pointerX-px) > .0001 || Math.abs(s.pointerY-py) > .0001 || Math.abs((s.hovering ? 1 : 0)-hover) > .0001 || Math.abs((s.night ? 1 : 0)-night) > .0001) settleFrames = 0;
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
      [faceGeometry, backGeometry, hubGeometry, rimFaceGeometry, edgeGeometry, hubEdgeGeometry, sheenGeometry, shadowGeometry, contourGeometry, fieldGeometry, ...haloGeometries].forEach(g => g.dispose());
      [...materials, edgeMaterial, hubMaterial, backMaterial, sheenMaterial, shadowMaterial, contourMaterial, haloMaterial, fieldMaterial].forEach(m => m.dispose());
      textures.forEach(t => t.dispose()); shadowTexture.dispose(); environment.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [state, onReady, onError]);
  return <div className="disc-canvas" ref={host} aria-hidden="true" />;
}
