'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const GRAVITY = -9.8
const COUNT = 5 // 中間值：同時存在的煙火數量

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

interface FireworkInstance {
  id: number
  mesh: THREE.Points
  particles: Particle[]
  time: number
  lifetime: number
  color: THREE.Color
}

export function Fireworks({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const fireworksRef = useRef<FireworkInstance[]>([])
  const nextIdRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    // If not active, ensure we clean up any existing scene
    if (!active) {
      if (rendererRef.current) {
        const renderer = rendererRef.current
        renderer.dispose()
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement)
        }
        rendererRef.current = null
        sceneRef.current = null
        cameraRef.current = null
        fireworksRef.current = []
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
      }
      return
    }

    // If active and already running, do nothing (or maybe re-spawn?)
    if (rendererRef.current) return

    // Initialize Three.js
    const width = window.innerWidth
    const height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.z = 10
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Set canvas style to ensure it's visible
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    
    containerRef.current.appendChild(canvas)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    // Animation Loop
    let lastTime = performance.now()

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1) // Cap delta
      lastTime = time

      // Spawn new fireworks
      if (fireworksRef.current.length < COUNT && Math.random() < 0.035) {
        spawnFirework(scene)
      }

      // Update existing fireworks
      updateFireworks(delta, scene)

      renderer.render(scene, camera)
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    // Spawn initial fireworks
    for(let i=0; i<3; i++) {
      setTimeout(() => {
        if(sceneRef.current) {
          spawnFirework(sceneRef.current)
        }
      }, i * 250)
    }

    // Handle Resize
    const handleResize = () => {
      if (!camera || !renderer) return
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      if (renderer) {
        renderer.dispose()
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
      // Cleanup scene objects
      fireworksRef.current.forEach(fw => {
        fw.mesh.geometry.dispose()
        ;(fw.mesh.material as THREE.Material).dispose()
      })
      fireworksRef.current = []
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
    }
  }, [active])

  // Helper functions remain the same...
  const spawnFirework = (scene: THREE.Scene) => {
    const id = nextIdRef.current++
    
    // ⚡ 讓煙火出現在表單外側（畫面邊緣）
    // 隨機選擇左側或右側
    const side = Math.random() > 0.5 ? 1 : -1
    const x = side * (4 + Math.random() * 4) // 距離中心 4-8 單位
    const y = (Math.random() - 0.3) * 6 // 稍微偏上
    const z = (Math.random() - 0.5) * 3

    const colors = ['#ff0040', '#00ff40', '#0040ff', '#ffff00', '#ff00ff', '#00ffff']
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)])

    const count = Math.floor(80 + Math.random() * 70) // 中間值：80-150 粒子
    const particles: Particle[] = []
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = 3 + Math.random() * 4 // Faster explosion

      const vx = Math.sin(phi) * Math.cos(theta) * speed
      const vy = Math.sin(phi) * Math.sin(theta) * speed
      const vz = Math.cos(phi) * speed

      particles.push({ x: 0, y: 0, z: 0, vx, vy, vz })
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      size: 0.25, // Bigger particles
      color: color,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    const mesh = new THREE.Points(geometry, material)
    scene.add(mesh)

    fireworksRef.current.push({
      id,
      mesh,
      particles,
      time: 0,
      lifetime: 2 + Math.random(),
      color
    })
  }

  const updateFireworks = (delta: number, scene: THREE.Scene) => {
    for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
      const fw = fireworksRef.current[i]
      fw.time += delta

      if (fw.time > fw.lifetime) {
        scene.remove(fw.mesh)
        fw.mesh.geometry.dispose()
        ;(fw.mesh.material as THREE.Material).dispose()
        fireworksRef.current.splice(i, 1)
        continue
      }

      const positions = fw.mesh.geometry.attributes.position.array as Float32Array
      
      for (let j = 0; j < fw.particles.length; j++) {
        const p = fw.particles[j]
        p.vy += GRAVITY * delta * 0.5
        positions[j * 3] += p.vx * delta
        positions[j * 3 + 1] += p.vy * delta
        positions[j * 3 + 2] += p.vz * delta
      }

      fw.mesh.geometry.attributes.position.needsUpdate = true
      const material = fw.mesh.material as THREE.PointsMaterial
      material.opacity = Math.max(0, 1 - fw.time / fw.lifetime)
    }
  }

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
    />
  )
}
