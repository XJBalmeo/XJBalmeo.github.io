const fs = require('fs');
let code = fs.readFileSync('src/components/CityScene.jsx', 'utf8');

// 1. Replace createBuildingTextures
code = code.replace(/const createBuildingTextures = \(\) => \{[\s\S]*?const buildingTextures = createBuildingTextures\(\);/, `const createBuildingTextures = () => {
  const textures = [];
  
  const c1 = document.createElement('canvas');
  c1.width = 256; c1.height = 256;
  const ctx1 = c1.getContext('2d');
  ctx1.fillStyle = '#020202';
  ctx1.fillRect(0, 0, 256, 256);
  for(let x=10; x<256; x+=30) {
    for(let y=10; y<256; y+=35) {
      if(Math.random() > 0.7) {
        ctx1.fillStyle = ['#fdf08a', '#7dd3fc', '#fde047'][Math.floor(Math.random()*3)];
        ctx1.shadowBlur = 20; ctx1.shadowColor = ctx1.fillStyle;
      } else {
        ctx1.fillStyle = '#000000';
        ctx1.shadowBlur = 0;
      }
      ctx1.fillRect(x, y, 20, 25);
    }
  }
  const t1 = new THREE.CanvasTexture(c1);
  t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
  textures.push(t1);

  const c2 = document.createElement('canvas');
  c2.width = 256; c2.height = 256;
  const ctx2 = c2.getContext('2d');
  ctx2.fillStyle = '#050505'; 
  ctx2.fillRect(0, 0, 256, 256);
  for(let x=16; x<256; x+=48) {
    for(let y=16; y<256; y+=40) {
      if(Math.random() > 0.6) {
        ctx2.fillStyle = '#ffedd5';
        ctx2.shadowBlur = 15; ctx2.shadowColor = ctx2.fillStyle;
      } else {
        ctx2.fillStyle = '#000000';
        ctx2.shadowBlur = 0;
      }
      ctx2.fillRect(x, y, 24, 28);
    }
  }
  const t2 = new THREE.CanvasTexture(c2);
  t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
  textures.push(t2);

  const c3 = document.createElement('canvas');
  c3.width = 256; c3.height = 256;
  const ctx3 = c3.getContext('2d');
  ctx3.fillStyle = '#01050a'; 
  ctx3.fillRect(0, 0, 256, 256);
  for(let x=4; x<256; x+=16) {
    for(let y=4; y<256; y+=20) {
      if(Math.random() > 0.85) {
        ctx3.fillStyle = ['#2dd4bf', '#a78bfa', '#f472b6'][Math.floor(Math.random()*3)];
        ctx3.shadowBlur = 10; ctx3.shadowColor = ctx3.fillStyle;
      } else {
        ctx3.fillStyle = '#000000';
        ctx3.shadowBlur = 0;
      }
      ctx3.fillRect(x, y, 12, 16);
    }
  }
  const t3 = new THREE.CanvasTexture(c3);
  t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
  textures.push(t3);

  return textures;
};
const buildingTextures = createBuildingTextures();`);

// 2. AmbientCityGrid
code = code.replace(/function AmbientCityGrid\(\) \{[\s\S]*?function Car\(\{ carData \}\)/, `function AmbientCityGrid() {
  const { blocks, roads, parks, cafes } = useMemo(() => {
    const bldgs = [];
    const roadPlanes = [];
    const parkLocs = [];
    const cafeLocs = [];
    
    for (let i = -4; i <= 4; i++) {
       const pos = i * SPACING;
       roadPlanes.push({ pos: [pos, 0.01, 0], scale: [ROAD_WIDTH, 120], rot: [-Math.PI/2, 0, 0] });
       roadPlanes.push({ pos: [0, 0.02, pos], scale: [120, ROAD_WIDTH], rot: [-Math.PI/2, 0, 0] });
    }

    const colors = ['#0a0a0a', '#050505', '#111111', '#000000'];
    for (let xIdx = -3; xIdx <= 3; xIdx++) {
      for (let zIdx = -3; zIdx <= 3; zIdx++) {
        const centerX = xIdx * SPACING + (SPACING / 2); 
        const centerZ = zIdx * SPACING + (SPACING / 2);

        const isInteractiveBlock = interactiveBuildings.some(b => 
          Math.abs(b.position[0] - centerX) < 1 && Math.abs(b.position[2] - centerZ) < 1
        );
        if (isInteractiveBlock) continue;

        const rand = Math.random();
        if (rand > 0.9) {
          parkLocs.push([centerX, 0, centerZ]);
          continue;
        } else if (rand > 0.8) {
          cafeLocs.push([centerX, 0, centerZ]);
          continue;
        }

        for(let dx of [-1.2, 1.2]) {
            for(let dz of [-1.2, 1.2]) {
                if (Math.random() > 0.85) continue; 
                
                const bx = centerX + dx;
                const bz = centerZ + dz;
                const height = Math.random() * 8 + 3.0; 
                const scale = [Math.random() * 1.5 + 1.2, height, Math.random() * 1.5 + 1.2];
                const hasNeon = Math.random() > 0.6;
                const neonColor = ['#f472b6', '#38bdf8', '#a78bfa', '#34d399'][Math.floor(Math.random() * 4)];
                
                bldgs.push({
                    position: [bx, height / 2, bz],
                    scale,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    hasNeon, neonColor,
                    texIndex: Math.floor(Math.random() * 3)
                });
            }
        }
      }
    }
    return { blocks: bldgs, roads: roadPlanes, parks: parkLocs, cafes: cafeLocs };
  }, []);

  return (
    <group>
      {roads.map((r, i) => {
         const isVertical = r.scale[0] === ROAD_WIDTH;
         const tex = isVertical ? roadTextureVertical.clone() : roadTextureHorizontal.clone();
         tex.needsUpdate = true;
         if (isVertical) {
           tex.repeat.set(1, r.scale[1] / 10);
         } else {
           tex.repeat.set(r.scale[0] / 10, 1);
         }

         return (
         <group key={\`road-\${i}\`} position={r.pos} rotation={r.rot}>
            <mesh receiveShadow>
               <planeGeometry args={r.scale} />
               <meshStandardMaterial map={tex} roughness={0.8} polygonOffset={true} polygonOffsetFactor={-1} />
            </mesh>
            <mesh position={[isVertical ? ROAD_WIDTH/2 + 0.6 : 0, isVertical ? 0 : ROAD_WIDTH/2 + 0.6, 0.01]} receiveShadow>
               <planeGeometry args={isVertical ? [1.2, r.scale[1]] : [r.scale[0], 1.2]} />
               <meshStandardMaterial color="#333333" roughness={1} polygonOffset={true} polygonOffsetFactor={-2} />
            </mesh>
            <mesh position={[isVertical ? -ROAD_WIDTH/2 - 0.6 : 0, isVertical ? 0 : -ROAD_WIDTH/2 - 0.6, 0.01]} receiveShadow>
               <planeGeometry args={isVertical ? [1.2, r.scale[1]] : [r.scale[0], 1.2]} />
               <meshStandardMaterial color="#333333" roughness={1} polygonOffset={true} polygonOffsetFactor={-2} />
            </mesh>
         </group>
      )})}

      {blocks.map((b, i) => <BuildingMesh key={\`bldg-\${i}\`} b={b} />)}
      
      {parks.map((p, i) => (
        <group key={\`park-\${i}\`} position={p}>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[4.8, 4.8]} />
            <meshStandardMaterial color="#064e3b" roughness={1} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.8, 0.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} emissive="#0ea5e9" emissiveIntensity={1} />
            <pointLight color="#38bdf8" intensity={2} distance={5} />
          </mesh>
          {[[-1.5, -1.5], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5]].map((tp, ti) => (
            <group key={ti} position={[tp[0], 0, tp[1]]}>
              <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.1, 0.8]} />
                <meshStandardMaterial color="#451a03" />
              </mesh>
              <mesh position={[0, 1.2, 0]} castShadow>
                <sphereGeometry args={[0.6, 8, 8]} />
                <meshStandardMaterial color="#065f46" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {cafes.map((c, i) => (
        <group key={\`cafe-\${i}\`} position={c}>
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 2, 3]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0.8, 1.51]}>
            <planeGeometry args={[2.5, 1.2]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} transparent opacity={0.9} />
            <pointLight color="#fef08a" intensity={3} distance={6} />
          </mesh>
          <Html position={[0, 2.3, 1.5]} center distanceFactor={15}>
            <div className="text-[#fca5a5] font-bold text-xs tracking-widest border border-[#fca5a5] px-2 py-1 rounded bg-black/80" style={{ textShadow: '0 0 10px #fca5a5' }}>
              CAFE
            </div>
          </Html>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
}

function Car({ carData })`);

// 3. Traffic and Pedestrians
code = code.replace(/function Traffic\(\) \{[\s\S]*?function StreetLights\(\) \{/, `function Traffic() {
  const initialCars = useMemo(() => {
    const cars = [];
    const roads = [-24, -16, -8, 0, 8, 16, 24];
    
    for (let i = 0; i < 25; i++) {
      const isZAxis = Math.random() > 0.5; 
      const roadPos = roads[Math.floor(Math.random() * roads.length)];
      
      const isPositiveLane = Math.random() > 0.5;
      const laneOffset = isPositiveLane ? 0.5 : -0.5;
      const fixedAxisPos = roadPos + laneOffset;
      
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 8 + 4) * (isPositiveLane ? 1 : -1);
      
      const color = ['#ffffff', '#ff3333', '#3333ff', '#111111', '#ffcc00'][Math.floor(Math.random() * 5)];
      cars.push({ isZAxis, fixedAxisPos, startPos, speed, color });
    }
    return cars;
  }, []);

  return (
    <group>
      {initialCars.map((car, i) => <Car key={i} carData={car} />)}
    </group>
  );
}

function Pedestrian({ data }) {
  const pedRef = useRef();
  const [bob, setBob] = useState(Math.random() * Math.PI);

  useFrame((state, delta) => {
    if (pedRef.current) {
      if (data.isZAxis) {
        pedRef.current.position.z += data.speed * delta;
        if (pedRef.current.position.z > 60) pedRef.current.position.z = -60;
        if (pedRef.current.position.z < -60) pedRef.current.position.z = 60;
      } else {
        pedRef.current.position.x += data.speed * delta;
        if (pedRef.current.position.x > 60) pedRef.current.position.x = -60;
        if (pedRef.current.position.x < -60) pedRef.current.position.x = 60;
      }
      
      setBob(b => b + delta * 10);
      pedRef.current.position.y = 0.2 + Math.abs(Math.sin(bob)) * 0.05;
    }
  });

  return (
    <group ref={pedRef} position={[data.isZAxis ? data.fixedAxisPos : data.startPos, 0.2, data.isZAxis ? data.startPos : data.fixedAxisPos]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
        <meshStandardMaterial color={data.color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pedestrians() {
  const peds = useMemo(() => {
    const arr = [];
    const sidewalks = [-25.8, -22.2, -17.8, -14.2, -9.8, -6.2, -1.8, 1.8, 6.2, 9.8, 14.2, 17.8, 22.2, 25.8];
    for(let i=0; i<60; i++) {
      const isZAxis = Math.random() > 0.5;
      const fixedAxisPos = sidewalks[Math.floor(Math.random() * sidewalks.length)];
      const startPos = Math.random() * 120 - 60;
      const speed = (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1);
      const color = \`hsl(\${Math.random() * 360}, 40%, 30%)\`;
      arr.push({ isZAxis, fixedAxisPos, startPos, speed, color });
    }
    return arr;
  }, []);

  return <group>{peds.map((p, i) => <Pedestrian key={i} data={p} />)}</group>;
}

function StreetLights() {`);

// 4. Lighting and fog
code = code.replace(/<Canvas shadows>[\s\S]*?<AmbientCityGrid \/>/, \`<Canvas shadows>
          <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={30} />
          <color attach="background" args={['#02040a']} />
          <fog attach="fog" args={['#02040a', 20, 100]} />
          
          <ambientLight intensity={0.1} color="#ffffff" />
          <directionalLight position={[20, 40, 20]} intensity={0.3} color="#4338ca" castShadow shadow-mapSize={[2048, 2048]} />
          
          <pointLight position={[0, 20, 0]} intensity={0.5} color="#818cf8" distance={80} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.2} radius={0.6} />
          </EffectComposer>
          
          <Stars radius={60} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
          
          <AmbientCityGrid />\`);

// 5. Add Pedestrians to Canvas rendering
code = code.replace(/<Traffic \/>/, \`<Traffic />
          <Pedestrians />\`);

// 6. Remove DIGITAL EXPERIENCE
code = code.replace(/<div className="flex flex-col items-start w-full mt-auto mb-12 md:mb-20 pointer-events-auto">[\s\S]*?<motion\.div \n                className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 mt-6 w-full max-w-2xl"/, \`<div className="flex flex-col items-start w-full mt-auto mb-12 md:mb-20 pointer-events-auto">
              <motion.div 
                className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 mt-6 w-full max-w-2xl"\`);

// 7. Update subtitle text
code = code.replace(/Crafting high-end, logic-driven digital realms\.<br\/>[\s\S]*?A seamless blend of 3D engineering & modern design\./, \`Explore the intersection of logic and imagination.<br/>
                  Click on the highlighted blocks to discover.\`);

fs.writeFileSync('src/components/CityScene.jsx', code);
