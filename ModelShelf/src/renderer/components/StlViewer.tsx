import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Center, Environment, OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

interface StlModelProps {
  url: string
  isHovered: boolean
  isThumbnail: boolean
}

function Model({ url, isHovered, isThumbnail }: StlModelProps) {
  const geom = useLoader(STLLoader, 'local://' + encodeURIComponent(url.replace(/\\/g, '/')))
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (isHovered && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  // Basic material
  const material = new THREE.MeshStandardMaterial({
    color: '#88aaff',
    roughness: 0.4,
    metalness: 0.1
  })

  return (
    <Center>
      <mesh ref={meshRef} geometry={geom} material={material} castShadow receiveShadow />
    </Center>
  )
}

export default function StlViewer({ url, isHovered, isThumbnail = false }: { url: string, isHovered: boolean, isThumbnail?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 50, 100], fov: 45 }}
      style={{ width: '100%', height: '100%', background: isThumbnail ? 'transparent' : '#1a1a1a' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -10]} intensity={0.2} />
      <React.Suspense fallback={null}>
        <Model url={url} isHovered={isHovered} isThumbnail={isThumbnail} />
        {!isThumbnail && <Environment preset="city" />}
        {!isThumbnail && <OrbitControls makeDefault />}
      </React.Suspense>
    </Canvas>
  )
}
