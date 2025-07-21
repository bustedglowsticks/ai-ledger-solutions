/*
 * QUANTUM YIELD NEXUS DASHBOARD - 3D BOT HEAT MAP
 * Interactive Three.js visualization with zoom/orbit controls, yield/volume color coding, and commission flows
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Eye,
  RotateCcw,
  Maximize2
} from 'lucide-react';

// Individual Bot Sphere Component
const BotSphere = ({ bot, position, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Color based on yield performance
  const getColor = () => {
    if (bot.yield >= 80) return '#00ff66'; // Nexus green for high yield
    if (bot.yield >= 60) return '#0066ff'; // Nexus blue for good yield
    if (bot.yield >= 40) return '#9966ff'; // Nexus purple for medium yield
    return '#ff6666'; // Red for low yield
  };

  // Size based on volume
  const getSize = () => {
    return Math.max(0.5, Math.min(2.0, bot.volume / 50000));
  };

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + bot.id) * 0.1;
      
      // Rotation based on activity
      meshRef.current.rotation.x += 0.01 * (bot.yield / 100);
      meshRef.current.rotation.y += 0.01 * (bot.volume / 100000);
      
      // Pulsing effect for selected bot
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(bot)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : 1}
      >
        <sphereGeometry args={[getSize(), 32, 32]} />
        <meshStandardMaterial 
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={hovered ? 0.9 : 0.8}
        />
      </mesh>
      
      {/* Bot label */}
      <Text
        position={[0, getSize() + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        visible={hovered || isSelected}
      >
        {bot.name}
      </Text>
      
      {/* Yield indicator */}
      <Text
        position={[0, getSize() + 0.8, 0]}
        fontSize={0.2}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
        visible={hovered || isSelected}
      >
        {bot.yield.toFixed(1)}% APY
      </Text>
      
      {/* Hover info panel */}
      {hovered && (
        <Html position={[getSize() + 1, 0, 0]}>
          <div className="bg-nexus-dark/90 border border-nexus-blue/50 rounded-lg p-3 text-white text-sm backdrop-blur-sm">
            <div className="font-tech font-bold text-nexus-green mb-1">{bot.name}</div>
            <div className="space-y-1">
              <div>Yield: <span className="text-nexus-green">{bot.yield.toFixed(1)}%</span></div>
              <div>Volume: <span className="text-nexus-blue">${(bot.volume / 1000).toFixed(0)}K</span></div>
              <div>Status: <span className={bot.status === 'active' ? 'text-nexus-green' : 'text-yellow-500'}>{bot.status}</span></div>
              <div>Commission: <span className="text-nexus-purple">${bot.commission}</span></div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Commission Flow Particles
const CommissionFlow = ({ from, to, amount, color = '#00ff66' }) => {
  const particlesRef = useRef();
  const particleCount = Math.min(50, Math.max(10, amount / 10));
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const z = from[2] + (to[2] - from[2]) * t;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [from, to, particleCount]);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const t = (i / particleCount + time * 0.1) % 1;
        
        positions[i3] = from[0] + (to[0] - from[0]) * t;
        positions[i3 + 1] = from[1] + (to[1] - from[1]) * t + Math.sin(time + i) * 0.1;
        positions[i3 + 2] = from[2] + (to[2] - from[2]) * t;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.8} />
    </points>
  );
};

// Main 3D Scene Component
const Scene3D = ({ bots, selectedBot, onBotSelect, showCommissionFlows }) => {
  const { camera } = useThree();
  
  // Generate bot positions in 3D space
  const botPositions = useMemo(() => {
    return bots.map((bot, index) => {
      const angle = (index / bots.length) * Math.PI * 2;
      const radius = 5 + (bot.yield / 100) * 3;
      const height = (bot.volume / 100000) * 4 - 2;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [bots]);

  // Commission flows between bots
  const commissionFlows = useMemo(() => {
    const flows = [];
    for (let i = 0; i < bots.length - 1; i++) {
      if (bots[i].commission > 100) {
        flows.push({
          from: botPositions[i],
          to: botPositions[i + 1],
          amount: bots[i].commission,
          color: bots[i].yield > 60 ? '#00ff66' : '#0066ff'
        });
      }
    }
    return flows;
  }, [bots, botPositions]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ff66" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
      
      {/* Bot spheres */}
      {bots.map((bot, index) => (
        <BotSphere
          key={bot.id}
          bot={bot}
          position={botPositions[index]}
          onClick={onBotSelect}
          isSelected={selectedBot?.id === bot.id}
        />
      ))}
      
      {/* Commission flows */}
      {showCommissionFlows && commissionFlows.map((flow, index) => (
        <CommissionFlow
          key={index}
          from={flow.from}
          to={flow.to}
          amount={flow.amount}
          color={flow.color}
        />
      ))}
      
      {/* Grid helper */}
      <gridHelper args={[20, 20, '#333333', '#333333']} />
      
      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main Heat Map Component
const BotHeatMap3D = ({ bots = [] }) => {
  const [selectedBot, setSelectedBot] = useState(null);
  const [showCommissionFlows, setShowCommissionFlows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewMode, setViewMode] = useState('yield'); // yield, volume, commission

  // Generate sample bot data if none provided
  const sampleBots = useMemo(() => {
    if (bots.length > 0) return bots;
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Bot-${i + 1}`,
      yield: 40 + Math.random() * 50,
      volume: 20000 + Math.random() * 80000,
      commission: 100 + Math.random() * 500,
      status: Math.random() > 0.2 ? 'active' : 'idle',
      ecoScore: 60 + Math.random() * 40
    }));
  }, [bots]);

  const handleBotSelect = (bot) => {
    setSelectedBot(bot);
  };

  const resetCamera = () => {
    // This would reset camera position - implementation depends on camera ref
    setSelectedBot(null);
  };

  return (
    <div className="nexus-card p-6 h-[600px] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-tech font-bold text-nexus-green flex items-center space-x-2">
          <Activity className="w-6 h-6" />
          <span>3D Bot Heat Map</span>
        </h3>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCommissionFlows(!showCommissionFlows)}
            className={`px-3 py-1 rounded text-sm font-tech transition-colors ${
              showCommissionFlows 
                ? 'bg-nexus-green text-black' 
                : 'bg-nexus-gray text-white hover:bg-nexus-green/20'
            }`}
          >
            Commission Flows
          </button>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1 rounded text-sm font-tech transition-colors ${
              autoRotate 
                ? 'bg-nexus-blue text-black' 
                : 'bg-nexus-gray text-white hover:bg-nexus-blue/20'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetCamera}
            className="px-3 py-1 rounded text-sm font-tech bg-nexus-gray text-white hover:bg-nexus-purple/20 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-[500px] bg-nexus-dark/50 rounded-lg overflow-hidden border border-nexus-blue/30">
        <Canvas
          camera={{ position: [15, 10, 15], fov: 60 }}
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
        >
          <Scene3D
            bots={sampleBots}
            selectedBot={selectedBot}
            onBotSelect={handleBotSelect}
            showCommissionFlows={showCommissionFlows}
          />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-nexus-dark/80 backdrop-blur-sm rounded-lg p-3 border border-nexus-blue/30">
        <div className="text-sm font-tech text-white mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-green rounded-full"></div>
            <span className="text-gray-300">80%+ APY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-blue rounded-full"></div>
            <span className="text-gray-300">60-80% APY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-purple rounded-full"></div>
            <span className="text-gray-300">40-60% APY</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">&lt;40% APY</span>
          </div>
        </div>
      </div>

      {/* Selected Bot Info */}
      {selectedBot && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-16 right-4 bg-nexus-dark/90 backdrop-blur-sm rounded-lg p-4 border border-nexus-green/50 min-w-[200px]"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-tech font-bold text-nexus-green">{selectedBot.name}</h4>
            <button
              onClick={() => setSelectedBot(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Yield:</span>
              <span className="text-nexus-green font-tech">{selectedBot.yield.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volume:</span>
              <span className="text-nexus-blue font-tech">${(selectedBot.volume / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commission:</span>
              <span className="text-nexus-purple font-tech">${selectedBot.commission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={selectedBot.status === 'active' ? 'text-nexus-green' : 'text-yellow-500'}>
                {selectedBot.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Eco Score:</span>
              <span className="text-nexus-green font-tech">{selectedBot.ecoScore.toFixed(0)}/100</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-nexus-blue/30">
            <div className="text-xs text-gray-400 mb-1">Performance</div>
            <div className="w-full bg-nexus-gray rounded-full h-2">
              <div 
                className="bg-nexus-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${selectedBot.yield}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 text-right">
        <div>Click & drag to orbit • Scroll to zoom</div>
        <div>Click bots for details • Hover for quick info</div>
      </div>
    </div>
  );
};

export default BotHeatMap3D;
