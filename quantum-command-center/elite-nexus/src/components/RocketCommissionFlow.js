import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Matter from 'matter-js';
import { Wallet, Zap, DollarSign, TrendingUp } from 'lucide-react';

const RocketCommissionFlow = ({ bots, godMode, masterWallet }) => {
  const containerRef = useRef();
  const engineRef = useRef();
  const [activeRockets, setActiveRockets] = useState([]);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Physics engine setup
  useEffect(() => {
    const { Engine, World, Bodies, Body, Events } = Matter;
    
    const engine = Engine.create();
    engine.world.gravity.y = 0.3; // Gentle gravity for arcing trajectories
    engineRef.current = engine;

    // Create boundaries (invisible walls)
    const walls = [
      Bodies.rectangle(200, 0, 400, 10, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(200, 400, 400, 10, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(0, 200, 10, 400, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(400, 200, 10, 400, { isStatic: true, render: { visible: false } })
    ];

    World.add(engine.world, walls);

    // Run the engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  // Launch rocket animation with physics
  const launchRocket = (bot, targetX = 200, targetY = 200) => {
    if (!containerRef.current) return;

    const rocketId = `rocket-${Date.now()}-${Math.random()}`;
    const startX = Math.random() * 300 + 50;
    const startY = Math.random() * 300 + 50;
    
    // Create rocket element
    const rocket = document.createElement('div');
    rocket.id = rocketId;
    rocket.className = 'absolute w-6 h-6 text-2xl pointer-events-none z-10';
    rocket.innerHTML = '🚀';
    rocket.style.left = `${startX}px`;
    rocket.style.top = `${startY}px`;
    rocket.style.transform = 'rotate(45deg)';
    
    containerRef.current.appendChild(rocket);

    // Create physics body for the rocket
    const { Bodies, World, Body } = Matter;
    const rocketBody = Bodies.circle(startX, startY, 5, {
      frictionAir: 0.01,
      restitution: 0.8,
      render: { visible: false }
    });

    World.add(engineRef.current.world, rocketBody);

    // Apply initial force towards target with some randomness
    const forceX = (targetX - startX) * 0.0003 + (Math.random() - 0.5) * 0.0002;
    const forceY = (targetY - startY) * 0.0003 - 0.0005; // Upward force for arc
    
    Body.applyForce(rocketBody, { x: startX, y: startY }, { x: forceX, y: forceY });

    // Create particle trail
    const createTrail = () => {
      const trail = document.createElement('div');
      trail.className = 'absolute w-1 h-1 bg-blue-400 rounded-full pointer-events-none';
      trail.style.left = `${rocketBody.position.x}px`;
      trail.style.top = `${rocketBody.position.y}px`;
      containerRef.current.appendChild(trail);

      gsap.to(trail, {
        opacity: 0,
        scale: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => trail.remove()
      });
    };

    // Update rocket position based on physics
    let trailCounter = 0;
    const updateRocket = () => {
      if (!rocket.parentNode) return;

      const { x, y } = rocketBody.position;
      rocket.style.left = `${x}px`;
      rocket.style.top = `${y}px`;

      // Calculate rotation based on velocity
      const angle = Math.atan2(rocketBody.velocity.y, rocketBody.velocity.x);
      rocket.style.transform = `rotate(${angle}rad)`;

      // Create trail particles
      if (trailCounter % 3 === 0) {
        createTrail();
      }
      trailCounter++;

      // Check if rocket reached target area
      const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
      if (distance < 30) {
        explodeRocket(x, y, bot);
        World.remove(engineRef.current.world, rocketBody);
        rocket.remove();
      } else if (x < -50 || x > 450 || y > 450) {
        // Remove if out of bounds
        World.remove(engineRef.current.world, rocketBody);
        rocket.remove();
      } else {
        requestAnimationFrame(updateRocket);
      }
    };

    updateRocket();

    // Add to active rockets
    setActiveRockets(prev => [...prev, { id: rocketId, bot, timestamp: Date.now() }]);
  };

  // Explosion effect when rocket reaches target
  const explodeRocket = (x, y, bot) => {
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full pointer-events-none';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      containerRef.current.appendChild(particle);

      const angle = (i / 12) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      gsap.to(particle, {
        x: endX - x,
        y: endY - y,
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    }

    // Create commission amount display
    const commissionDisplay = document.createElement('div');
    commissionDisplay.className = 'absolute bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold pointer-events-none z-20';
    commissionDisplay.innerHTML = `+$${bot.commissions}`;
    commissionDisplay.style.left = `${x - 20}px`;
    commissionDisplay.style.top = `${y - 10}px`;
    containerRef.current.appendChild(commissionDisplay);

    gsap.fromTo(commissionDisplay, 
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.3,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(commissionDisplay, {
            y: -30,
            opacity: 0,
            duration: 1,
            delay: 1,
            onComplete: () => commissionDisplay.remove()
          });
        }
      }
    );

    // Update totals
    setTotalCommissions(prev => prev + bot.commissions);
    setRecentTransactions(prev => [
      { bot: bot.name, amount: bot.commissions, timestamp: Date.now() },
      ...prev.slice(0, 4)
    ]);
  };

  // Auto-launch rockets periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (bots.length > 0) {
        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        if (randomBot.status === 'active') {
          launchRocket(randomBot);
        }
      }
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

    return () => clearInterval(interval);
  }, [bots]);

  // Manual rocket launch on bot click
  const handleBotClick = (bot) => {
    launchRocket(bot);
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-apple-gray-900 to-apple-gray-800 rounded-xl overflow-hidden">
      {/* Physics container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Central Master Wallet */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            👑
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold whitespace-nowrap">
            Master Wallet
          </div>
        </div>
      </div>

      {/* Bot Launch Zones */}
      <div className="absolute inset-4 pointer-events-none">
        {bots.filter(bot => bot.status === 'active').slice(0, 6).map((bot, index) => {
          const angle = (index / 6) * Math.PI * 2;
          const radius = 120;
          const x = 200 + Math.cos(angle) * radius;
          const y = 200 + Math.sin(angle) * radius;

          return (
            <div
              key={bot.id}
              className="absolute w-12 h-12 bg-apple-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-apple-blue-700 transition-colors pointer-events-auto"
              style={{ left: `${x - 24}px`, top: `${y - 24}px` }}
              onClick={() => handleBotClick(bot)}
              title={`${bot.name} - Click to launch commission`}
            >
              <span className="text-white text-xs font-bold">
                {bot.name.split(' ')[0].charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold">Commission Flow</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Total Collected:</span>
            <span className="font-bold text-green-400">${totalCommissions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Rockets:</span>
            <span className="font-bold text-blue-400">{activeRockets.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="font-bold text-purple-400">XRPL</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold">Recent Commissions</span>
        </div>
        <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="truncate mr-2">{tx.bot}</span>
                <span className="font-bold text-green-400">${tx.amount}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No recent transactions</div>
          )}
        </div>
      </div>

      {/* God Mode Indicator */}
      {godMode && (
        <div className="absolute bottom-4 left-4 bg-purple-600/80 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs font-bold">
          👑 God View Active
        </div>
      )}

      {/* Launch Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
        <div className="flex items-center space-x-1">
          <span>💡</span>
          <span>Click bot circles to launch rockets</span>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RocketCommissionFlow;
