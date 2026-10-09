import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles, Eye, RotateCw, Activity, Layers, Loader2 } from 'lucide-react';

interface Hero3DCanvasProps {
  orbState?: 'idle' | 'listening' | 'processing' | 'responding';
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ orbState = 'idle' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 560;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1220, 0.03);

    // Camera setup with anatomically calibrated framing for a 1.83m human figure
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.0, 3.25);
    camera.lookAt(0, 0, 0);

    // High performance WebGL renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting for Medical Holography
    const ambientLight = new THREE.AmbientLight(0x0f766e, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x14b8a6, 4.2);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const bottomFillLight = new THREE.DirectionalLight(0x0284c7, 1.8);
    bottomFillLight.position.set(0, -4, 2);
    scene.add(bottomFillLight);

    // Internal cardiac illumination
    const cardiacLight = new THREE.PointLight(0xf43f5e, 4.0, 3);
    cardiacLight.position.set(0.02, 0.48, 0.08);
    scene.add(cardiacLight);

    // Root interactive assembly group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0.05, 0);
    scene.add(rootGroup);

    // Group for the real human anatomical body & internal organs
    const anatomicalGroup = new THREE.Group();
    rootGroup.add(anatomicalGroup);

    // Organ meshes reference for dynamic animation loops
    const animatedOrgans: { heart?: THREE.Object3D; lungs?: THREE.Object3D; brain?: THREE.Object3D } = {};

    // -------------------------------------------------------------
    // LOAD GENUINE NIH HUMAN ANATOMICAL ASSETS
    // -------------------------------------------------------------
    const gltfLoader = new GLTFLoader();
    let loadedAssetsCount = 0;
    const totalAssets = 4; // Skin, Heart, Lungs, Brain

    const updateProgress = () => {
      loadedAssetsCount++;
      setLoadingProgress(Math.round((loadedAssetsCount / totalAssets) * 100));
      if (loadedAssetsCount >= totalAssets) {
        setIsLoaded(true);
      }
    };

    // 1. Genuine Human Skin Silhouette & Envelope (NIH Visible Human Male)
    gltfLoader.load(
      '/models/VH_M_Skin.glb',
      (gltf) => {
        const bodyMesh = gltf.scene;

        bodyMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            // Translucent medical holographic glass material
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x0891b2,
              emissive: 0x0e7490,
              emissiveIntensity: 0.35,
              roughness: 0.18,
              metalness: 0.1,
              transmission: 0.72,
              ior: 1.25,
              transparent: true,
              opacity: 0.78,
              depthWrite: false,
              side: THREE.DoubleSide,
            });

            // Add fine holographic wireframe contour
            const wireframeClone = mesh.clone();
            wireframeClone.material = new THREE.MeshBasicMaterial({
              color: 0x38bdf8,
              wireframe: true,
              transparent: true,
              opacity: 0.09,
            });
            bodyMesh.add(wireframeClone);
          }
        });

        anatomicalGroup.add(bodyMesh);
        updateProgress();
      },
      undefined,
      (err) => {
        console.warn('Fallback: could not load VH_M_Skin.glb, trying human_body.glb', err);
        // Fallback to secondary genuine human body asset
        gltfLoader.load('/models/human_body.glb', (gltf2) => {
          const body2 = gltf2.scene;
          body2.scale.set(1.8, 1.8, 1.8);
          body2.rotation.y = Math.PI / 2;
          body2.traverse((c) => {
            if ((c as THREE.Mesh).isMesh) {
              (c as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
                color: 0x0891b2,
                emissive: 0x0e7490,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.8,
                transmission: 0.7,
              });
            }
          });
          anatomicalGroup.add(body2);
          updateProgress();
        });
      }
    );

    // 2. Genuine Human Heart (NIH HuBMAP Visible Human Male Heart & Great Vessels)
    gltfLoader.load(
      '/models/VH_M_Heart.glb',
      (gltf) => {
        const heartModel = gltf.scene;
        heartModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              emissive: 0xe11d48,
              emissiveIntensity: 0.85,
              roughness: 0.25,
              metalness: 0.3,
            });
          }
        });
        animatedOrgans.heart = heartModel;
        anatomicalGroup.add(heartModel);
        updateProgress();
      },
      undefined,
      (e) => {
        console.warn('Heart load note:', e);
        updateProgress();
      }
    );

    // 3. Genuine Human Lungs (NIH HuBMAP Visible Human Male Bilateral Lungs)
    gltfLoader.load(
      '/models/VH_M_Lung.glb',
      (gltf) => {
        const lungsModel = gltf.scene;
        lungsModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0x0284c7,
              emissive: 0x0369a1,
              emissiveIntensity: 0.45,
              roughness: 0.35,
              metalness: 0.2,
              transparent: true,
              opacity: 0.82,
            });
          }
        });
        animatedOrgans.lungs = lungsModel;
        anatomicalGroup.add(lungsModel);
        updateProgress();
      },
      undefined,
      (e) => {
        console.warn('Lung load note:', e);
        updateProgress();
      }
    );

    // 4. Genuine Human Brain (Allen Institute / NIH HuBMAP Brain)
    gltfLoader.load(
      '/models/Allen_M_Brain_v1.0.glb',
      (gltf) => {
        const brainModel = gltf.scene;
        brainModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.75,
              roughness: 0.3,
              metalness: 0.25,
              transparent: true,
              opacity: 0.88,
            });
          }
        });
        animatedOrgans.brain = brainModel;
        anatomicalGroup.add(brainModel);
        updateProgress();
      },
      undefined,
      (e) => {
        console.warn('Brain load note:', e);
        updateProgress();
      }
    );

    // 5. Optional Abdominal Organs (Liver & Pelvis)
    gltfLoader.load('/models/VH_M_Liver.glb', (gltf) => {
      gltf.scene.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          (c as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            emissive: 0xb45309,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.75,
          });
        }
      });
      anatomicalGroup.add(gltf.scene);
    });

    gltfLoader.load('/models/VH_M_Pelvis.glb', (gltf) => {
      gltf.scene.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          (c as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            emissive: 0x64748b,
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.85,
          });
        }
      });
      anatomicalGroup.add(gltf.scene);
    });

    // -------------------------------------------------------------
    // GLOWING AI DIAGNOSTIC ORB / TELEMETRY BEACON
    // -------------------------------------------------------------
    const orbGroup = new THREE.Group();
    orbGroup.position.set(0.95, 0.75, 0.3);
    rootGroup.add(orbGroup);

    const orbGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: 0x0d9488,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.9,
    });
    const aiOrb = new THREE.Mesh(orbGeo, orbMat);
    orbGroup.add(aiOrb);

    const auraGeo = new THREE.SphereGeometry(0.18, 20, 20);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    orbGroup.add(auraMesh);

    // -------------------------------------------------------------
    // DUAL ORBITAL DATA RINGS
    // -------------------------------------------------------------
    const ringGroup = new THREE.Group();
    rootGroup.add(ringGroup);

    const ring1Geo = new THREE.TorusGeometry(1.25, 0.009, 8, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x0d9488, wireframe: true, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.45, 0.007, 8, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    ringGroup.add(ring2);

    // -------------------------------------------------------------
    // BIO-QUANTUM PARTICLE CLOUD
    // -------------------------------------------------------------
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const cTeal = new THREE.Color(0x0d9488);
    const cSky = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.8 + Math.random() * 1.4;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.cos(phi) * 1.1;
      particlePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const mixed = cTeal.clone().lerp(cSky, Math.random());
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // -------------------------------------------------------------
    // INTERACTIVE HOTSPOT MARKERS (Aligned to NIH CCF coordinates)
    // -------------------------------------------------------------
    const hotspots = [
      { id: 'cranial', name: 'Neural Diagnostics', pos: [0, 0.82, 0.12] as [number, number, number] },
      { id: 'cardiac', name: 'Cardiac Vascular Rhythm', pos: [0.02, 0.48, 0.12] as [number, number, number] },
      { id: 'pulmonary', name: 'Pulmonary Biomarkers', pos: [-0.08, 0.54, 0.12] as [number, number, number] },
    ];

    hotspots.forEach((hs) => {
      const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...hs.pos);
      rootGroup.add(marker);

      const pulseRing = new THREE.Mesh(
        new THREE.RingGeometry(0.06, 0.08, 20),
        new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
      );
      pulseRing.position.copy(marker.position);
      pulseRing.position.z += 0.01;
      rootGroup.add(pulseRing);
    });

    // -------------------------------------------------------------
    // USER ROTATION AND PARALLAX CONTROLS
    // -------------------------------------------------------------
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;
    let rotX = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) {
        // Subtle tilt parallax towards cursor
        targetRotY = x * 0.35;
        targetRotX = -y * 0.15;
        return;
      }

      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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
    // ANIMATION RENDER LOOP
    // -------------------------------------------------------------
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      if (!isReducedMotion) {
        // Real physiological heartbeat rhythm (systole & diastole)
        if (animatedOrgans.heart) {
          const beat = 1.0 + Math.sin(elapsed * 4.6) * 0.06 + Math.max(0, Math.sin(elapsed * 9.2)) * 0.03;
          animatedOrgans.heart.scale.set(beat, beat, beat);
        }

        // Pulmonary breathing expansion cycle
        if (animatedOrgans.lungs) {
          const breath = 1.0 + Math.sin(elapsed * 1.8) * 0.035;
          animatedOrgans.lungs.scale.set(breath, breath, breath);
        }

        // Cranial synaptic pulsation
        if (animatedOrgans.brain) {
          const brainPulse = 1.0 + Math.sin(elapsed * 2.8) * 0.02;
          animatedOrgans.brain.scale.set(brainPulse, brainPulse, brainPulse);
        }

        // AI Diagnostic Orb orbital flight
        orbGroup.position.x = 0.95 + Math.cos(elapsed * 1.4) * 0.12;
        orbGroup.position.y = 0.75 + Math.sin(elapsed * 1.8) * 0.15;
        auraMesh.rotation.y += 0.015;
        auraMesh.rotation.x += 0.01;

        // Data rings subtle gyro rotation
        ring1.rotation.z += 0.006;
        ring2.rotation.z -= 0.004;

        // Particle cloud gentle rotation
        particles.rotation.y += 0.0015;
      }

      // Smooth damping interpolation to target rotation
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      rootGroup.rotation.y = rotY;
      rootGroup.rotation.x = rotX;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isReducedMotion]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-[520px] md:h-[600px] flex flex-col items-center justify-center bg-[#101B2D]/90 rounded-3xl border border-teal-500/30 p-8 text-center text-slate-300">
        <Sparkles className="w-12 h-12 text-teal-400 mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">Holographic 3D System (Fallback)</h3>
        <p className="text-sm max-w-sm text-slate-400">
          WebGL rendering is not active in this environment. Interactive clinical telemetry & 3D anatomical viewer fallbacks are active.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] md:h-[600px] select-none">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden focus:outline-none"
        title="Interactive 3D Hologram: Drag to rotate, move pointer to tilt"
      />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0a1220]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-20 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-9 h-9 text-teal-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
            Loading NIH Human Anatomical Hologram...
          </p>
          <div className="w-36 h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating 3D Telemetry Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#101B2D]/90 backdrop-blur-md border border-teal-500/40 px-3.5 py-1.5 rounded-full text-xs font-medium text-teal-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>NIH 3D Human Anatomy Hologram • Real-time WebGL</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1 rounded-full text-[11px] text-slate-300">
          <Activity className="w-3 h-3 text-sky-400" />
          <span>Visible Human Male CCF Dataset • Heartbeat & Synaptic Rhythm Active</span>
        </div>
      </div>

      {/* Camera & Motion Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsReducedMotion((prev) => !prev)}
          className="flex items-center gap-1.5 bg-[#101B2D]/85 backdrop-blur-md hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition shadow"
          title="Toggle reduced motion"
        >
          <RotateCw className="w-3.5 h-3.5 text-teal-400" />
          <span>{isReducedMotion ? 'Resume Motion' : 'Calm Motion'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#101B2D]/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>Drag to inspect 360°</span>
        </div>
      </div>

      {/* Interactive Medical Hotspot Quick Tags */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setActiveHotspot(activeHotspot === 'cranial' ? null : 'cranial')}
          className={`text-xs px-3 py-1.5 rounded-lg transition border font-semibold ${
            activeHotspot === 'cranial'
              ? 'bg-sky-500/30 border-sky-400 text-sky-200'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-sky-500'
          }`}
        >
          Neural Plexus
        </button>
        <button
          type="button"
          onClick={() => setActiveHotspot(activeHotspot === 'cardiac' ? null : 'cardiac')}
          className={`text-xs px-3 py-1.5 rounded-lg transition border font-semibold ${
            activeHotspot === 'cardiac'
              ? 'bg-rose-500/30 border-rose-400 text-rose-200'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-rose-500'
          }`}
        >
          Cardiac Mediastinum
        </button>
      </div>

      {/* Hotspot Drawer Card */}
      {activeHotspot && (
        <div className="absolute top-16 right-4 z-10 max-w-xs bg-slate-900/95 backdrop-blur-md border border-teal-500/50 p-4 rounded-2xl text-left shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              {activeHotspot === 'cranial' ? 'Neuro-Telemetry (Allen Human Brain)' : 'Cardiovascular (Visible Human Heart)'}
            </span>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeHotspot === 'cranial'
              ? 'Allen Institute 3D human brain model mapped with bilateral cerebral hemispheres, cerebellum, and neuro-vascular trunk.'
              : 'Visible Human Male 4-chamber cardiac architecture with ascending aorta, pulmonary trunk, and coronary vasculature.'}
          </p>
        </div>
      )}
    </div>
  );
};
