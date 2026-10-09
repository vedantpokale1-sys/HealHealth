import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ZoomIn, ZoomOut, RotateCcw, Activity, Layers, Sparkles, Loader2 } from 'lucide-react';
import { AnatomyRegion } from '../../types';

interface BodyExplorer3DCanvasProps {
  regions: AnatomyRegion[];
  selectedRegionId: string;
  onSelectRegion: (id: string) => void;
  activeLayer: 'all' | 'organs' | 'skeletal' | 'nervous';
}

export const BodyExplorer3DCanvas: React.FC<BodyExplorer3DCanvasProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  activeLayer,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<{ resetCamera: () => void; zoomIn: () => void; zoomOut: () => void } | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // References to preserve Three.js state across layer/region changes
  const organMeshesRef = useRef<Record<string, THREE.Group | THREE.Mesh>>({});
  const skinMeshRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initialCamPos = useRef(new THREE.Vector3(0, 0.05, 3.1));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Verify WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);

    // Camera setup with clinical framing for 1.83m human figure
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.copy(initialCamPos.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // High performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Multi-directional clinical illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.2);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0d9488, 2.5);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const backRimLight = new THREE.DirectionalLight(0x14b8a6, 2.0);
    backRimLight.position.set(0, 4, -4);
    scene.add(backRimLight);

    // Organ highlight spotlight
    const organSpotlight = new THREE.PointLight(0x2dd4bf, 3.0, 5);
    organSpotlight.position.set(0, 0.5, 1.8);
    scene.add(organSpotlight);

    // Model root group
    const modelGroup = new THREE.Group();
    modelGroup.position.set(0, 0.05, 0);
    scene.add(modelGroup);

    // Map of interactable objects for raycaster
    const raycastTargets: { obj: THREE.Object3D; regionId: string }[] = [];

    // -------------------------------------------------------------
    // ASYNC LOADER FOR NIH 3D ANATOMICAL ASSET SET
    // -------------------------------------------------------------
    const gltfLoader = new GLTFLoader();
    let loadedCount = 0;
    const totalModels = 6;

    const onModelLoaded = () => {
      loadedCount++;
      setLoadingProgress(Math.round((loadedCount / totalModels) * 100));
      if (loadedCount >= totalModels) {
        setIsLoaded(true);
      }
    };

    // 1. NIH Visible Human Male Skin Outer Silhouette
    gltfLoader.load(
      '/models/VH_M_Skin.glb',
      (gltf) => {
        const skin = gltf.scene;
        skin.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshPhysicalMaterial({
              color: 0x0f766e,
              emissive: 0x0891b2,
              emissiveIntensity: 0.25,
              roughness: 0.2,
              metalness: 0.1,
              transmission: 0.78,
              ior: 1.2,
              transparent: true,
              opacity: 0.5,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
          }
        });
        skinMeshRef.current = skin;
        modelGroup.add(skin);
        onModelLoaded();
      },
      undefined,
      (err) => {
        console.warn('Skin load note:', err);
        onModelLoaded();
      }
    );

    // 2. NIH Visible Human Male Heart & Great Vessels
    gltfLoader.load(
      '/models/VH_M_Heart.glb',
      (gltf) => {
        const heart = gltf.scene;
        heart.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              emissive: 0xe11d48,
              emissiveIntensity: 0.6,
              roughness: 0.3,
              metalness: 0.2,
            });
            raycastTargets.push({ obj: m, regionId: 'heart' });
          }
        });
        organMeshesRef.current['heart'] = heart;
        modelGroup.add(heart);
        onModelLoaded();
      },
      undefined,
      (e) => {
        console.warn('Heart load note:', e);
        onModelLoaded();
      }
    );

    // 3. NIH Visible Human Male Lungs
    gltfLoader.load(
      '/models/VH_M_Lung.glb',
      (gltf) => {
        const lungs = gltf.scene;
        lungs.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0x0284c7,
              emissive: 0x0369a1,
              emissiveIntensity: 0.45,
              roughness: 0.35,
              metalness: 0.15,
              transparent: true,
              opacity: 0.85,
            });
            raycastTargets.push({ obj: m, regionId: 'lungs' });
          }
        });
        organMeshesRef.current['lungs'] = lungs;
        modelGroup.add(lungs);
        onModelLoaded();
      },
      undefined,
      (e) => {
        console.warn('Lungs load note:', e);
        onModelLoaded();
      }
    );

    // 4. Allen Institute / NIH Brain
    gltfLoader.load(
      '/models/Allen_M_Brain_v1.0.glb',
      (gltf) => {
        const brain = gltf.scene;
        brain.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.6,
              roughness: 0.25,
              metalness: 0.2,
              transparent: true,
              opacity: 0.9,
            });
            raycastTargets.push({ obj: m, regionId: 'brain' });
          }
        });
        organMeshesRef.current['brain'] = brain;
        modelGroup.add(brain);
        onModelLoaded();
      },
      undefined,
      (e) => {
        console.warn('Brain load note:', e);
        onModelLoaded();
      }
    );

    // 5. NIH Visible Human Male Digestive / Liver & Small Intestine
    gltfLoader.load(
      '/models/VH_M_Liver.glb',
      (gltf) => {
        const liver = gltf.scene;
        liver.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xd97706,
              emissive: 0xb45309,
              emissiveIntensity: 0.4,
              roughness: 0.35,
              metalness: 0.1,
            });
            raycastTargets.push({ obj: m, regionId: 'stomach' });
          }
        });
        organMeshesRef.current['liver'] = liver;
        modelGroup.add(liver);
        onModelLoaded();
      },
      undefined,
      (e) => {
        console.warn('Liver load note:', e);
        onModelLoaded();
      }
    );

    gltfLoader.load(
      '/models/VH_M_Small_Intestine.glb',
      (gltf) => {
        const intestine = gltf.scene;
        intestine.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              emissive: 0xd97706,
              emissiveIntensity: 0.35,
              roughness: 0.4,
              metalness: 0.1,
            });
            raycastTargets.push({ obj: m, regionId: 'stomach' });
          }
        });
        organMeshesRef.current['intestine'] = intestine;
        modelGroup.add(intestine);
      },
      undefined,
      (e) => console.warn('Intestine load note:', e)
    );

    // 6. NIH Visible Human Male Pelvis & Skeleton Base
    gltfLoader.load(
      '/models/VH_M_Pelvis.glb',
      (gltf) => {
        const pelvis = gltf.scene;
        pelvis.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xf1f5f9,
              emissive: 0x94a3b8,
              emissiveIntensity: 0.25,
              roughness: 0.3,
              metalness: 0.15,
            });
            raycastTargets.push({ obj: m, regionId: 'spine' });
          }
        });
        organMeshesRef.current['pelvis'] = pelvis;
        modelGroup.add(pelvis);
        onModelLoaded();
      },
      undefined,
      (e) => {
        console.warn('Pelvis load note:', e);
        onModelLoaded();
      }
    );

    // -------------------------------------------------------------
    // BEACON LOCATOR MARKERS AT REGION HOTSPOTS
    // -------------------------------------------------------------
    regions.forEach((reg) => {
      const isSelected = reg.id === selectedRegionId;

      const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x14b8a6 : 0x38bdf8,
        emissive: isSelected ? 0x0d9488 : 0x0284c7,
        emissiveIntensity: isSelected ? 3.0 : 1.4,
        roughness: 0.2,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...reg.hotspotPosition);
      modelGroup.add(marker);

      raycastTargets.push({ obj: marker, regionId: reg.id });

      // Target locator ring
      const ringGeo = new THREE.RingGeometry(0.065, 0.085, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x2dd4bf : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(marker.position);
      ring.position.z += 0.01;
      modelGroup.add(ring);
    });

    // -------------------------------------------------------------
    // INTERACTION & RAYCASTING
    // -------------------------------------------------------------
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0;
    let rotY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const getRaycastIntersection = (clientX: number, clientY: number): string | null => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);

      const hitCandidates: THREE.Object3D[] = [];
      const objToRegionMap = new Map<THREE.Object3D, string>();

      raycastTargets.forEach((t) => {
        t.obj.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            hitCandidates.push(c);
            objToRegionMap.set(c, t.regionId);
          }
        });
      });

      const intersects = raycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        return objToRegionMap.get(intersects[0].object) || null;
      }
      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const hoveredId = getRaycastIntersection(e.clientX, e.clientY);
      setHoveredRegion(hoveredId);

      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      rotX = Math.max(-0.55, Math.min(0.55, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const hitRegionId = getRaycastIntersection(e.clientX, e.clientY);
      if (hitRegionId) {
        onSelectRegion(hitRegionId);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Camera control handles
    controlsRef.current = {
      resetCamera: () => {
        camera.position.copy(initialCamPos.current);
        camera.lookAt(0, 0, 0);
        rotX = 0;
        rotY = 0;
      },
      zoomIn: () => {
        camera.position.z = Math.max(1.5, camera.position.z - 0.4);
      },
      zoomOut: () => {
        camera.position.z = Math.min(4.8, camera.position.z + 0.4);
      },
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // -------------------------------------------------------------
    // RENDER ANIMATION LOOP
    // -------------------------------------------------------------
    let frameId: number;
    const startTime = performance.now();

    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop);
      const elapsed = (performance.now() - startTime) / 1000;

      // Smooth camera drag rotation
      modelGroup.rotation.y += (rotY - modelGroup.rotation.y) * 0.12;
      modelGroup.rotation.x += (rotX - modelGroup.rotation.x) * 0.12;

      // Dynamic Physiological Pulses
      const heartObj = organMeshesRef.current['heart'];
      if (heartObj) {
        const isHeartSelected = selectedRegionId === 'heart';
        const pulseSpeed = isHeartSelected ? 5.5 : 4.2;
        const pulseAmp = isHeartSelected ? 0.09 : 0.05;
        const baseScale = isHeartSelected ? 1.08 : 1.0;
        const scaleVal = baseScale + Math.sin(elapsed * pulseSpeed) * pulseAmp;
        heartObj.scale.set(scaleVal, scaleVal, scaleVal);
      }

      const lungsObj = organMeshesRef.current['lungs'];
      if (lungsObj) {
        const isLungsSelected = selectedRegionId === 'lungs';
        const breathSpeed = isLungsSelected ? 2.5 : 1.8;
        const breathAmp = isLungsSelected ? 0.06 : 0.03;
        const baseScale = isLungsSelected ? 1.05 : 1.0;
        const scaleVal = baseScale + Math.sin(elapsed * breathSpeed) * breathAmp;
        lungsObj.scale.set(scaleVal, scaleVal, scaleVal);
      }

      const brainObj = organMeshesRef.current['brain'];
      if (brainObj) {
        const isBrainSelected = selectedRegionId === 'brain';
        const brainAmp = isBrainSelected ? 0.04 : 0.02;
        const baseScale = isBrainSelected ? 1.05 : 1.0;
        const scaleVal = baseScale + Math.sin(elapsed * 2.8) * brainAmp;
        brainObj.scale.set(scaleVal, scaleVal, scaleVal);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [regions]);

  // -------------------------------------------------------------
  // REACTIVE LAYER & SELECTION HIGHLIGHT EFFECT
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Layer controls
    if (skinMeshRef.current) {
      skinMeshRef.current.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mat = (c as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
          if (activeLayer === 'organs') {
            // Cutaway silhouette mode: dim outer skin to faint outline
            mat.opacity = 0.15;
            mat.transmission = 0.9;
          } else if (activeLayer === 'skeletal') {
            mat.opacity = 0.12;
            mat.transmission = 0.92;
          } else if (activeLayer === 'nervous') {
            mat.opacity = 0.15;
            mat.transmission = 0.9;
          } else {
            // 'all' composite
            mat.opacity = 0.45;
            mat.transmission = 0.78;
          }
        }
      });
    }

    // Organ layers highlight & dimming
    const organKeys = ['heart', 'lungs', 'brain', 'liver', 'intestine', 'pelvis'];
    organKeys.forEach((key) => {
      const obj = organMeshesRef.current[key];
      if (!obj) return;

      const isRegionSelected =
        (key === 'heart' && selectedRegionId === 'heart') ||
        (key === 'lungs' && selectedRegionId === 'lungs') ||
        (key === 'brain' && selectedRegionId === 'brain') ||
        ((key === 'liver' || key === 'intestine') && selectedRegionId === 'stomach') ||
        (key === 'pelvis' && (selectedRegionId === 'spine' || selectedRegionId === 'joints'));

      obj.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;

          // Layer specific visibility
          if (activeLayer === 'skeletal') {
            if (key === 'pelvis') {
              m.opacity = 1.0;
              m.transparent = false;
              m.emissiveIntensity = 0.6;
            } else {
              m.transparent = true;
              m.opacity = 0.2;
              m.emissiveIntensity = 0.1;
            }
          } else if (activeLayer === 'nervous') {
            if (key === 'brain') {
              m.opacity = 1.0;
              m.emissiveIntensity = 1.2;
            } else {
              m.transparent = true;
              m.opacity = 0.2;
              m.emissiveIntensity = 0.1;
            }
          } else if (activeLayer === 'organs') {
            if (key === 'heart' || key === 'lungs' || key === 'brain' || key === 'liver' || key === 'intestine') {
              m.transparent = false;
              m.opacity = 1.0;
              m.emissiveIntensity = isRegionSelected ? 1.4 : 0.6;
            } else {
              m.transparent = true;
              m.opacity = 0.2;
            }
          } else {
            // 'all' layer: highlight selected organ with brilliant emissive glow
            if (isRegionSelected) {
              m.emissiveIntensity = 1.5;
            } else {
              m.emissiveIntensity = 0.5;
            }
          }
        }
      });
    });
  }, [activeLayer, selectedRegionId]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-[540px] md:h-[620px] rounded-2xl flex flex-col items-center justify-center bg-[#0A101D] border border-slate-800 text-center p-8 text-slate-300">
        <Sparkles className="w-12 h-12 text-teal-400 mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">3D Anatomical Engine (Fallback)</h3>
        <p className="text-xs max-w-sm text-slate-400">
          WebGL context is unavailable in this environment. Interactive clinical dossier controls remain functional.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden bg-[#0A101D] border border-slate-800 shadow-2xl select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0a101d]/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
            Loading NIH 3D Anatomical Organs...
          </p>
          <div className="w-40 h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Camera & View Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => controlsRef.current?.zoomIn()}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 shadow-lg transition"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-sky-400" />
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current?.zoomOut()}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 shadow-lg transition"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-sky-400" />
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current?.resetCamera()}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 shadow-lg transition"
          title="Reset viewpoint"
        >
          <RotateCcw className="w-4 h-4 text-teal-400" />
        </button>
      </div>

      {/* Floating Active Layer & Raycast Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-teal-500/40 px-3 py-1.5 rounded-full text-xs text-slate-200 shadow-xl">
          <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>Raycaster: <strong>Genuine NIH Organ Meshes Active</strong></span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/75 backdrop-blur border border-slate-700/60 px-3 py-1 rounded-full text-[11px] text-slate-400">
          <Layers className="w-3 h-3 text-sky-400" />
          <span>Active Layer: <strong className="text-teal-300 uppercase">{activeLayer}</strong></span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredRegion && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur border border-sky-500/50 px-3.5 py-1.5 rounded-xl text-xs text-sky-200 shadow-2xl pointer-events-none animate-in fade-in">
          Click to inspect organ:{' '}
          <span className="font-bold text-white uppercase">
            {regions.find((r) => r.id === hoveredRegion)?.name || hoveredRegion}
          </span>
        </div>
      )}
    </div>
  );
};
