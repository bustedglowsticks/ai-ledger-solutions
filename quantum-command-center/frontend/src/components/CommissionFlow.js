/*
 * 🚀 COMMISSION FLOW - Animated Rocket Visualization
 * GSAP-powered commission flow with smooth rocket animations
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';

const CommissionFlow = ({ bots, user }) => {
  const svgRef = useRef();
  const animationRef = useRef();

  useEffect(() => {
    if (!bots || bots.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr("width", width).attr("height", height);

    // Create gradient definitions
    const defs = svg.append("defs");
    
    // Rocket gradient
    const rocketGradient = defs.append("linearGradient")
      .attr("id", "rocketGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    rocketGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff6b6b");
    
    rocketGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffa500");

    // Commission flow gradient
    const flowGradient = defs.append("linearGradient")
      .attr("id", "flowGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    
    flowGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4ade80")
      .attr("stop-opacity", 0.8);
    
    flowGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22c55e")
      .attr("stop-opacity", 0.3);

    // Create main group
    const g = svg.append("g");

    // Central user node
    const userNode = g.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    userNode.append("circle")
      .attr("r", 40)
      .attr("fill", "url(#flowGradient)")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3);

    userNode.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-5")
      .attr("font-size", "12")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("YOU");

    userNode.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "10")
      .attr("font-size", "10")
      .attr("fill", "white")
      .text(`${(user?.totalCommissions || 0).toFixed(1)} XRP`);

    // Bot nodes in circular arrangement
    const angleStep = (2 * Math.PI) / bots.length;
    const radius = 180;

    bots.forEach((bot, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Bot node
      const botNode = g.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("class", `bot-node-${index}`);

      // Bot circle
      botNode.append("circle")
        .attr("r", 25)
        .attr("fill", d => {
          const yield = bot.yield || 0;
          if (yield > 60) return "#4ade80";
          if (yield > 40) return "#fbbf24";
          return "#ef4444";
        })
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Bot label
      botNode.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-5")
        .attr("font-size", "10")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(bot.name || `Bot ${bot.id}`);

      // Yield percentage
      botNode.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "8")
        .attr("font-size", "9")
        .attr("fill", "white")
        .text(`${(bot.yield || 0).toFixed(1)}%`);

      // Commission flow line
      const line = g.append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", centerX)
        .attr("y2", centerY)
        .attr("stroke", "url(#flowGradient)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.6);

      // Animate the dash
      gsap.to(line.node(), {
        strokeDashoffset: -10,
        duration: 2,
        repeat: -1,
        ease: "none"
      });

      // Create rocket for this bot
      const rocket = g.append("g")
        .attr("class", `rocket-${index}`)
        .attr("transform", `translate(${x}, ${y})`);

      // Rocket body (simplified)
      rocket.append("polygon")
        .attr("points", "0,-8 -4,4 0,8 4,4")
        .attr("fill", "url(#rocketGradient)")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      // Rocket flame
      const flame = rocket.append("polygon")
        .attr("points", "0,8 -2,12 0,16 2,12")
        .attr("fill", "#ff4444")
        .attr("opacity", 0.8);

      // Animate flame flickering
      gsap.to(flame.node(), {
        opacity: 0.4,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Rocket flight animation
      const commissionAmount = bot.commissions || 0;
      if (commissionAmount > 0) {
        // Calculate path from bot to center
        const pathData = `M ${x} ${y} Q ${(x + centerX) / 2} ${(y + centerY) / 2 - 50} ${centerX} ${centerY}`;
        
        // Create invisible path for rocket to follow
        const path = g.append("path")
          .attr("d", pathData)
          .attr("fill", "none")
          .attr("stroke", "none")
          .attr("id", `path-${index}`);

        // Animate rocket along path
        const animateRocket = () => {
          gsap.set(rocket.node(), { 
            motionPath: { path: `#path-${index}`, autoRotate: true },
            transformOrigin: "center"
          });
          
          gsap.fromTo(rocket.node(), 
            { motionPath: { path: `#path-${index}`, start: 0 } },
            { 
              motionPath: { path: `#path-${index}`, end: 1 },
              duration: 3 + Math.random() * 2,
              ease: "power2.inOut",
              onComplete: () => {
                // Reset rocket position and repeat
                setTimeout(animateRocket, 2000 + Math.random() * 3000);
              }
            }
          );
        };

        // Start animation with random delay
        setTimeout(animateRocket, Math.random() * 5000);
      }

      // Commission particles
      if (bot.commissions > 0) {
        for (let i = 0; i < 3; i++) {
          const particle = g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 2)
            .attr("fill", "#fbbf24")
            .attr("opacity", 0.8);

          // Animate particles floating to center
          gsap.to(particle.node(), {
            x: centerX - x,
            y: centerY - y,
            opacity: 0,
            duration: 4 + Math.random() * 2,
            delay: i * 0.5,
            repeat: -1,
            repeatDelay: 3,
            ease: "power2.out"
          });
        }
      }
    });

    // Pulsing effect for user node
    gsap.to(userNode.select("circle").node(), {
      r: 45,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    // Store animation reference for cleanup
    animationRef.current = gsap.getById("commission-flow");

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      gsap.killTweensOf("*");
    };

  }, [bots, user]);

  if (!bots || bots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🚀</div>
          <p>No commission flows to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-auto border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"></svg>
      <div className="mt-4 text-sm text-gray-600">
        <p>🚀 <strong>Commission Flow:</strong> Watch rockets carry commissions from your bots to your account. Larger rockets = higher commissions!</p>
      </div>
    </div>
  );
};

export default CommissionFlow;
