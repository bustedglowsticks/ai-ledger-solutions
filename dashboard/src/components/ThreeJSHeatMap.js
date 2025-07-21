/*
 * QUANTUM YIELD NEXUS DASHBOARD - 3D INTERACTIVE HEAT MAP
 * Revolutionary Three.js orbital bot clusters with yield/volatility visualization
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Bot Node Component - Individual bot visualization
const BotNode = ({ bot, position, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Color based on yield and volatility
  const getColor = () => {
    const yieldNorm = Math.min(bot.yield / 100, 1);
    const volatilityNorm = bot.volatility;
    
    if (yieldNorm > 0.8) return '#00ff66'; // High yield - green
    if (yieldNorm > 0.6) return '#ffcc00'; // Medium yield - yellow
    if (volatilityNorm > 0.7) return '#ff6600'; // High volatility - orange
    return '#0066ff'; // Default - blue
  };

  // Animate bot rotation and pulsing
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      
      // Pulse based on commission flow
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * (bot.commissionFlow / 1000);
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={bot.status === 'active' ? 0.9 : 0.5}
        />
      </Sphere>
      
      {/* Bot label */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={hovered}
      >
        {bot.name}
      </Text>
      
      {/* Yield indicator */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
        visible={hovered}
      >
        {bot.yield.toFixed(1)}% APY
      </Text>
      
      {/* Commission flow trail */}
      {bot.commissionFlow > 500 && (
        <CommissionTrail bot={bot} />
      )}
    </group>
  );
};

// Commission Trail Component - Particle flow visualization
const CommissionTrail = ({ bot }) => {
  const trailRef = useRef();
  const particles = useRef([]);
  
  useEffect(() => {
    // Initialize particles
    particles.current = Array.from({ length: 20 }, (_, i) => ({
      position: new THREE.Vector3(
        Math.random() * 4 - 2,
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      life: Math.random()
    }));
  }, []);

  useFrame(() => {
    if (trailRef.current) {
      particles.current.forEach((particle, i) => {
        particle.position.add(particle.velocity);
        particle.life -= 0.01;
        
        if (particle.life <= 0) {
          particle.position.set(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
          );
          particle.life = 1;
        }
      });
    }
  });

  return (
    <group ref={trailRef}>
      {particles.current.map((particle, i) => (
        <Sphere key={i} args={[0.02, 4, 4]} position={particle.position}>
          <meshBasicMaterial
            color="#00ff66"
            transparent
            opacity={particle.life * 0.8}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Orbital Ring Component - Visual enhancement
const OrbitalRing = ({ radius, color, speed = 1 }) => {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005 * speed;
    }
  });

  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ));
  }

  return (
    <group ref={ringRef}>
      <Line
        points={points}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.3}
      />
    </group>
  );
};

// Main Heat Map Scene
const HeatMapScene = ({ bots, onBotClick }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
      
      {/* Orbital rings for visual enhancement */}
      <OrbitalRing radius={8} color="#0066ff" speed={0.5} />
      <OrbitalRing radius={12} color="#6600ff" speed={0.3} />
      <OrbitalRing radius={16} color="#00ff66" speed={0.2} />
      
      {/* Bot nodes */}
      {bots.map((bot, index) => (
        <BotNode
          key={bot.id}
          bot={bot}
          position={bot.position || [
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          ]}
          onClick={() => onBotClick(bot)}
        />
      ))}
      
      {/* Central nexus core */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ff66"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Central nexus label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#00ff66"
        anchorX="center"
        anchorY="middle"
      >
        QUANTUM NEXUS
      </Text>
      
      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
};

// Main Component
const ThreeJSHeatMap = ({ bots = [] }) => {
  const [selectedBot, setSelectedBot] = useState(null);
  const [stats, setStats] = useState({
    totalYield: 0,
    avgVolatility: 0,
    activeCount: 0
  });

  useEffect(() => {
    if (bots.length > 0) {
      const totalYield = bots.reduce((sum, bot) => sum + bot.yield, 0);
      const avgVolatility = bots.reduce((sum, bot) => sum + bot.volatility, 0) / bots.length;
      const activeCount = bots.filter(bot => bot.status === 'active').length;
      
      setStats({
        totalYield: totalYield / bots.length,
        avgVolatility,
        activeCount
      });
    }
  }, [bots]);

  const handleBotClick = (bot) => {
    setSelectedBot(bot);
  };

  return (
    <div className="relative w-full h-96 bg-nexus-dark rounded-lg overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [15, 15, 15], fov: 60 }}
        style={{ background: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        <HeatMapScene bots={bots} onBotClick={handleBotClick} />
      </Canvas>
      
      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 nexus-card p-4 max-w-xs">
        <h4 className="font-tech font-bold text-nexus-green mb-2">Heat Map Stats</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Bots:</span>
            <span className="text-nexus-green font-tech">{stats.activeCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Yield:</span>
            <span className="text-nexus-blue font-tech">{stats.totalYield.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Volatility:</span>
            <span className="text-nexus-purple font-tech">{(stats.avgVolatility * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 nexus-card p-4 max-w-xs">
        <h4 className="font-tech font-bold text-white mb-2">Color Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-green rounded-full"></div>
            <span className="text-gray-300">High Yield (80%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-300">Medium Yield (60-80%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-300">High Volatility</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-blue rounded-full"></div>
            <span className="text-gray-300">Standard</span>
          </div>
        </div>
      </div>
      
      {/* Selected Bot Info */}
      {selectedBot && (
        <div className="absolute bottom-4 left-4 nexus-card p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-tech font-bold text-nexus-green">{selectedBot.name}</h4>
            <button
              onClick={() => setSelectedBot(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Yield:</span>
              <span className="text-nexus-green font-tech">{selectedBot.yield.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Confidence:</span>
              <span className="text-nexus-blue font-tech">{selectedBot.aiConfidence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commission Flow:</span>
              <span className="text-nexus-purple font-tech">${selectedBot.commissionFlow.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Eco Score:</span>
              <span className="text-nexus-green font-tech">{selectedBot.ecoScore.toFixed(0)}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-tech ${selectedBot.status === 'active' ? 'text-nexus-green' : 'text-yellow-500'}`}>
                {selectedBot.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
        <div>Left click + drag: Rotate</div>
        <div>Right click + drag: Pan</div>
        <div>Scroll: Zoom</div>
        <div>Click bot: View details</div>
      </div>
    </div>
  );
};

export default ThreeJSHeatMap;
