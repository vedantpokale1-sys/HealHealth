import * as THREE from 'three';

export interface AnatomicalMeshRegistry {
  skeletonGroup: THREE.Group;
  organGroup: THREE.Group;
  nervousGroup: THREE.Group;
  circulatoryGroup: THREE.Group;
  envelopeGroup: THREE.Group;
  organMeshes: { [key: string]: THREE.Object3D };
  allInteractableMeshes: { mesh: THREE.Object3D; regionId: string }[];
}

export function buildDetailedHumanAnatomy(isHolographic: boolean = false): AnatomicalMeshRegistry {
  const skeletonGroup = new THREE.Group();
  const organGroup = new THREE.Group();
  const nervousGroup = new THREE.Group();
  const circulatoryGroup = new THREE.Group();
  const envelopeGroup = new THREE.Group();

  const organMeshes: { [key: string]: THREE.Object3D } = {};
  const allInteractableMeshes: { mesh: THREE.Object3D; regionId: string }[] = [];

  // -------------------------------------------------------------
  // MATERIALS CONFIGURATION
  // -------------------------------------------------------------
  const boneMaterial = new THREE.MeshStandardMaterial({
    color: isHolographic ? 0x67e8f9 : 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.15,
    wireframe: isHolographic,
    transparent: true,
    opacity: isHolographic ? 0.75 : 0.9,
    emissive: isHolographic ? 0x0891b2 : 0x1e293b,
    emissiveIntensity: isHolographic ? 0.4 : 0.05,
  });

  const discMaterial = new THREE.MeshStandardMaterial({
    color: isHolographic ? 0x38bdf8 : 0x94a3b8,
    roughness: 0.5,
    transparent: true,
    opacity: 0.8,
  });

  // -------------------------------------------------------------
  // 1. SKELETAL SYSTEM
  // -------------------------------------------------------------
  // Cranial Vault (Skull)
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 1.82, 0);

  // Neurocranium
  const craniumGeo = new THREE.SphereGeometry(0.36, 24, 20);
  craniumGeo.scale(0.92, 1.05, 1.05);
  const craniumMesh = new THREE.Mesh(craniumGeo, boneMaterial);
  skullGroup.add(craniumMesh);

  // Facial Skeleton / Jaw (Maxilla and Mandible)
  const jawGeo = new THREE.BoxGeometry(0.38, 0.28, 0.36);
  const jawMesh = new THREE.Mesh(jawGeo, boneMaterial);
  jawMesh.position.set(0, -0.22, 0.08);
  jawMesh.scale.set(0.85, 0.9, 0.85);
  skullGroup.add(jawMesh);

  // Ocular Orbits (Eye sockets indentations)
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x0b1220 });
  const leftOrbit = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), orbitMat);
  leftOrbit.position.set(-0.13, -0.12, 0.28);
  skullGroup.add(leftOrbit);

  const rightOrbit = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), orbitMat);
  rightOrbit.position.set(0.13, -0.12, 0.28);
  skullGroup.add(rightOrbit);

  skeletonGroup.add(skullGroup);

  // Clavicles (Collar bones)
  const leftClavicle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), boneMaterial);
  leftClavicle.position.set(-0.35, 1.36, 0.08);
  leftClavicle.rotation.z = -0.15;
  leftClavicle.rotation.y = 0.2;
  skeletonGroup.add(leftClavicle);

  const rightClavicle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), boneMaterial);
  rightClavicle.position.set(0.35, 1.36, 0.08);
  rightClavicle.rotation.z = 0.15;
  rightClavicle.rotation.y = -0.2;
  skeletonGroup.add(rightClavicle);

  // Sternum (Breastbone)
  const sternumGeo = new THREE.BoxGeometry(0.12, 0.65, 0.04);
  const sternumMesh = new THREE.Mesh(sternumGeo, boneMaterial);
  sternumMesh.position.set(0, 1.0, 0.22);
  skeletonGroup.add(sternumMesh);

  // Articulated Vertebral Spine Column (Cervical, Thoracic, Lumbar)
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, 0.72, -0.06);

  const totalVertebrae = 18;
  for (let i = 0; i < totalVertebrae; i++) {
    const yPos = 0.75 - i * 0.075;
    const s = 1 - Math.abs(i - 9) * 0.02;

    const vertGeo = new THREE.CylinderGeometry(0.065 * s, 0.075 * s, 0.045, 12);
    const vertebra = new THREE.Mesh(vertGeo, boneMaterial);
    vertebra.position.set(0, yPos, Math.sin(i * 0.35) * 0.04);
    spineGroup.add(vertebra);

    // Intervertebral disc
    const discGeo = new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.02, 10);
    const disc = new THREE.Mesh(discGeo, discMaterial);
    disc.position.set(0, yPos - 0.03, Math.sin(i * 0.35) * 0.04);
    spineGroup.add(disc);
  }
  skeletonGroup.add(spineGroup);
  organMeshes['spine'] = spineGroup;
  allInteractableMeshes.push({ mesh: spineGroup, regionId: 'spine' });

  // Thoracic Ribcage (10 anatomical rib arches)
  const ribcageGroup = new THREE.Group();
  for (let r = 0; r < 9; r++) {
    const y = 1.32 - r * 0.085;
    const curvature = 0.44 - Math.abs(r - 4) * 0.035;
    const depth = 0.34 - Math.abs(r - 4) * 0.02;

    // Left rib arc
    const leftRibGeo = new THREE.TorusGeometry(curvature, 0.02, 8, 24, Math.PI * 0.85);
    const leftRib = new THREE.Mesh(leftRibGeo, boneMaterial);
    leftRib.position.set(-0.02, y, 0.05);
    leftRib.rotation.x = Math.PI / 2 + 0.15;
    leftRib.rotation.z = Math.PI * 0.1;
    leftRib.scale.set(1, depth / curvature, 1);
    ribcageGroup.add(leftRib);

    // Right rib arc
    const rightRibGeo = new THREE.TorusGeometry(curvature, 0.02, 8, 24, Math.PI * 0.85);
    const rightRib = new THREE.Mesh(rightRibGeo, boneMaterial);
    rightRib.position.set(0.02, y, 0.05);
    rightRib.rotation.x = Math.PI / 2 + 0.15;
    rightRib.rotation.z = -Math.PI * 0.1 - Math.PI * 0.85;
    rightRib.scale.set(1, depth / curvature, 1);
    ribcageGroup.add(rightRib);
  }
  skeletonGroup.add(ribcageGroup);

  // Pelvic Girdle (Iliac wings, Sacrum, Pubic symphysis)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, -0.22, 0);

  const iliumLeftGeo = new THREE.TorusGeometry(0.24, 0.05, 8, 16, Math.PI * 1.1);
  const iliumLeft = new THREE.Mesh(iliumLeftGeo, boneMaterial);
  iliumLeft.position.set(-0.16, 0.08, 0);
  iliumLeft.rotation.x = Math.PI / 2;
  iliumLeft.rotation.z = -0.3;
  pelvisGroup.add(iliumLeft);

  const iliumRightGeo = new THREE.TorusGeometry(0.24, 0.05, 8, 16, Math.PI * 1.1);
  const iliumRight = new THREE.Mesh(iliumRightGeo, boneMaterial);
  iliumRight.position.set(0.16, 0.08, 0);
  iliumRight.rotation.x = Math.PI / 2;
  iliumRight.rotation.z = 0.3 + Math.PI;
  pelvisGroup.add(iliumRight);

  // Sacrum
  const sacrumGeo = new THREE.ConeGeometry(0.12, 0.28, 6);
  const sacrum = new THREE.Mesh(sacrumGeo, boneMaterial);
  sacrum.position.set(0, 0.02, -0.06);
  sacrum.rotation.x = -Math.PI;
  pelvisGroup.add(sacrum);

  skeletonGroup.add(pelvisGroup);

  // Limbs / Femurs (Leg bones)
  const buildLimb = (posX: number, posY: number, angleZ: number, len: number) => {
    const limb = new THREE.Group();
    limb.position.set(posX, posY, 0);
    limb.rotation.z = angleZ;

    // Bone shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, len, 10), boneMaterial);
    shaft.position.y = -len / 2;
    limb.add(shaft);

    // Condyle / joint head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), boneMaterial);
    head.position.y = 0;
    limb.add(head);

    return limb;
  };

  // Left & Right Femurs
  const leftFemur = buildLimb(-0.24, -0.32, 0.05, 1.25);
  skeletonGroup.add(leftFemur);
  const rightFemur = buildLimb(0.24, -0.32, -0.05, 1.25);
  skeletonGroup.add(rightFemur);

  // Left & Right Tibia/Fibula (Lower legs)
  const leftTibia = buildLimb(-0.28, -1.6, 0.02, 1.2);
  skeletonGroup.add(leftTibia);
  const rightTibia = buildLimb(0.28, -1.6, -0.02, 1.2);
  skeletonGroup.add(rightTibia);

  // Arms (Humerus, Forearm)
  const leftHumerus = buildLimb(-0.62, 1.25, 0.2, 0.95);
  skeletonGroup.add(leftHumerus);
  const rightHumerus = buildLimb(0.62, 1.25, -0.2, 0.95);
  skeletonGroup.add(rightHumerus);

  organMeshes['joints'] = leftFemur;
  allInteractableMeshes.push({ mesh: leftFemur, regionId: 'joints' });

  // -------------------------------------------------------------
  // 2. INTERNAL ORGAN SYSTEM
  // -------------------------------------------------------------
  // Brain (Left and Right Hemispheres)
  const brainGroup = new THREE.Group();
  brainGroup.position.set(0, 1.84, 0.02);

  const brainMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xdb2777,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.1,
  });

  const leftHemiGeo = new THREE.SphereGeometry(0.24, 20, 20);
  leftHemiGeo.scale(0.8, 1.05, 1.2);
  const leftHemi = new THREE.Mesh(leftHemiGeo, brainMat);
  leftHemi.position.set(-0.11, 0, 0);
  brainGroup.add(leftHemi);

  const rightHemiGeo = new THREE.SphereGeometry(0.24, 20, 20);
  rightHemiGeo.scale(0.8, 1.05, 1.2);
  const rightHemi = new THREE.Mesh(rightHemiGeo, brainMat);
  rightHemi.position.set(0.11, 0, 0);
  brainGroup.add(rightHemi);

  // Cerebellum (Base of brain)
  const cerebellumGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const cerebellum = new THREE.Mesh(cerebellumGeo, brainMat);
  cerebellum.position.set(0, -0.18, -0.1);
  brainGroup.add(cerebellum);

  organGroup.add(brainGroup);
  organMeshes['brain'] = brainGroup;
  allInteractableMeshes.push({ mesh: brainGroup, regionId: 'brain' });

  // Heart (Anatomical 4-chamber shape, apex pointing left)
  const heartGroup = new THREE.Group();
  heartGroup.position.set(-0.07, 1.02, 0.12);

  const heartMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });

  // Ventricle muscular cone
  const heartBodyGeo = new THREE.SphereGeometry(0.16, 20, 20);
  heartBodyGeo.scale(0.9, 1.15, 0.85);
  const heartBody = new THREE.Mesh(heartBodyGeo, heartMat);
  heartBody.rotation.z = 0.25;
  heartGroup.add(heartBody);

  // Aorta arch
  const aortaGeo = new THREE.TorusGeometry(0.08, 0.03, 10, 20, Math.PI);
  const aortaMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, emissive: 0x991b1b, emissiveIntensity: 0.5 });
  const aorta = new THREE.Mesh(aortaGeo, aortaMat);
  aorta.position.set(0.02, 0.14, -0.02);
  aorta.rotation.y = Math.PI / 4;
  heartGroup.add(aorta);

  // Superior Vena Cava
  const venaCavaGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8);
  const venaCavaMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
  const venaCava = new THREE.Mesh(venaCavaGeo, venaCavaMat);
  venaCava.position.set(-0.06, 0.14, -0.02);
  heartGroup.add(venaCava);

  organGroup.add(heartGroup);
  organMeshes['heart'] = heartGroup;
  allInteractableMeshes.push({ mesh: heartGroup, regionId: 'heart' });

  // Lungs (Right 3 lobes, Left 2 lobes, concave base matching diaphragm)
  const lungsGroup = new THREE.Group();
  lungsGroup.position.set(0, 1.05, 0.06);

  const lungMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.5,
    transparent: true,
    opacity: 0.9,
  });

  // Trachea (Windpipe)
  const tracheaGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 12);
  const tracheaMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd });
  const trachea = new THREE.Mesh(tracheaGeo, tracheaMat);
  trachea.position.set(0, 0.32, 0.02);
  lungsGroup.add(trachea);

  // Left Lung
  const leftLungGeo = new THREE.CapsuleGeometry(0.14, 0.36, 12, 18);
  leftLungGeo.scale(0.85, 1.0, 0.95);
  const leftLung = new THREE.Mesh(leftLungGeo, lungMat);
  leftLung.position.set(-0.25, 0, 0);
  leftLung.rotation.z = 0.12;
  lungsGroup.add(leftLung);

  // Right Lung (Slightly larger)
  const rightLungGeo = new THREE.CapsuleGeometry(0.16, 0.38, 12, 18);
  rightLungGeo.scale(0.88, 1.0, 0.95);
  const rightLung = new THREE.Mesh(rightLungGeo, lungMat);
  rightLung.position.set(0.24, 0, 0);
  rightLung.rotation.z = -0.12;
  lungsGroup.add(rightLung);

  organGroup.add(lungsGroup);
  organMeshes['lungs'] = lungsGroup;
  allInteractableMeshes.push({ mesh: lungsGroup, regionId: 'lungs' });

  // Stomach & Gastrointestinal Tract
  const giGroup = new THREE.Group();
  giGroup.position.set(0, 0.58, 0.08);

  // J-shaped stomach
  const stomachMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    roughness: 0.4,
  });
  const stomachGeo = new THREE.SphereGeometry(0.18, 18, 18);
  stomachGeo.scale(1.1, 0.8, 0.85);
  const stomach = new THREE.Mesh(stomachGeo, stomachMat);
  stomach.position.set(0.09, 0.02, 0.04);
  stomach.rotation.z = -0.3;
  giGroup.add(stomach);

  // Liver (Wedge-shaped on the right side)
  const liverMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    emissive: 0x78350f,
    emissiveIntensity: 0.4,
    roughness: 0.45,
  });
  const liverGeo = new THREE.ConeGeometry(0.22, 0.28, 8);
  liverGeo.scale(1.2, 0.7, 0.9);
  const liver = new THREE.Mesh(liverGeo, liverMat);
  liver.position.set(-0.16, 0.08, 0.02);
  liver.rotation.z = Math.PI / 2 + 0.2;
  giGroup.add(liver);

  // Small Intestine coil
  const intestineMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.55 });
  const intestineGeo = new THREE.TorusGeometry(0.18, 0.06, 8, 24);
  const intestine = new THREE.Mesh(intestineGeo, intestineMat);
  intestine.position.set(0, -0.28, 0.06);
  giGroup.add(intestine);

  organGroup.add(giGroup);
  organMeshes['stomach'] = giGroup;
  allInteractableMeshes.push({ mesh: giGroup, regionId: 'stomach' });

  // -------------------------------------------------------------
  // 3. NERVOUS SYSTEM
  // -------------------------------------------------------------
  const nerveMat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });

  // Cranial Neural Plexus
  const neuralNetGeo = new THREE.IcosahedronGeometry(0.38, 2);
  const neuralNet = new THREE.Mesh(neuralNetGeo, nerveMat);
  neuralNet.position.set(0, 1.84, 0.02);
  nervousGroup.add(neuralNet);

  // Spinal Cord Trunk (Passing down cervical to lumbar canal)
  const spinalCordGeo = new THREE.CylinderGeometry(0.035, 0.025, 1.45, 8);
  const spinalCord = new THREE.Mesh(spinalCordGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  spinalCord.position.set(0, 0.75, -0.05);
  nervousGroup.add(spinalCord);

  // Brachial & Sciatic Nerve Fibers
  const addNerveFiber = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
    const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(lineGeo, lineMat);
    nervousGroup.add(line);
  };

  // Peripheral nerves branching
  addNerveFiber(0, 1.25, -0.05, -0.55, 0.9, 0);
  addNerveFiber(0, 1.25, -0.05, 0.55, 0.9, 0);
  addNerveFiber(0, 0.1, -0.05, -0.22, -0.9, 0);
  addNerveFiber(0, 0.1, -0.05, 0.22, -0.9, 0);

  // -------------------------------------------------------------
  // 4. CIRCULATORY SYSTEM
  // -------------------------------------------------------------
  const vascularMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 });
  const aortaVessel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.9, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  aortaVessel.position.set(-0.02, 0.65, 0.02);
  circulatoryGroup.add(aortaVessel);

  // -------------------------------------------------------------
  // 5. HOLOGRAPHIC BODY CONTOUR ENVELOPE (Human Silhouette)
  // -------------------------------------------------------------
  const envelopeMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.5,
    transparent: true,
    opacity: isHolographic ? 0.35 : 0.18,
    wireframe: isHolographic,
  });

  // Torso / Abdomen outer silhouette
  const torsoEnvelopeGeo = new THREE.CapsuleGeometry(0.42, 1.15, 12, 24);
  torsoEnvelopeGeo.scale(1.05, 1.0, 0.75);
  const torsoEnvelope = new THREE.Mesh(torsoEnvelopeGeo, envelopeMat);
  torsoEnvelope.position.set(0, 0.78, 0);
  envelopeGroup.add(torsoEnvelope);

  // Head envelope
  const headEnvelopeGeo = new THREE.SphereGeometry(0.42, 16, 16);
  headEnvelopeGeo.scale(0.85, 1.05, 0.95);
  const headEnvelope = new THREE.Mesh(headEnvelopeGeo, envelopeMat);
  headEnvelope.position.set(0, 1.82, 0);
  envelopeGroup.add(headEnvelope);

  return {
    skeletonGroup,
    organGroup,
    nervousGroup,
    circulatoryGroup,
    envelopeGroup,
    organMeshes,
    allInteractableMeshes,
  };
}
