/*
 * QUANTUM YIELD NEXUS DASHBOARD - LEDGER FLOW VISUALIZATION
 * Real-time XRPL ledger animations with commission flows as particle streams
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

const LedgerFlowVisualization = ({ commissions = [] }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [activeFlows, setActiveFlows] = useState([]);
  const [ledgerStats, setLedgerStats] = useState({
    totalFlow: 0,
    transactionCount: 0,
    avgCommission: 0
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(400, rect.height) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (commissions.length > 0) {
      const totalFlow = commissions.reduce((sum, c) => sum + c.amount, 0);
      const avgCommission = totalFlow / commissions.length;
      
      setLedgerStats({
        totalFlow,
        transactionCount: commissions.length,
        avgCommission
      });

      // Create active flows for animation
      const flows = commissions.slice(0, 20).map((commission, index) => ({
        ...commission,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        targetX: dimensions.width * 0.8,
        targetY: dimensions.height * 0.5,
        progress: 0,
        size: Math.max(2, Math.min(10, commission.amount / 50)),
        color: commission.type === 'nft_royalty' ? '#00ff66' : '#0066ff'
      }));
      
      setActiveFlows(flows);
    }
  }, [commissions, dimensions]);

  useEffect(() => {
    if (!svgRef.current || activeFlows.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Green gradient for NFT royalties
    const greenGradient = defs.append('radialGradient')
      .attr('id', 'greenGlow')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    greenGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00ff66')
      .attr('stop-opacity', 1);
    
    greenGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00ff66')
      .attr('stop-opacity', 0);

    // Blue gradient for trading fees
    const blueGradient = defs.append('radialGradient')
      .attr('id', 'blueGlow')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    blueGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0066ff')
      .attr('stop-opacity', 1);
    
    blueGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0066ff')
      .attr('stop-opacity', 0);

    // Create background grid
    const gridGroup = svg.append('g').attr('class', 'grid');
    
    // Vertical grid lines
    for (let i = 0; i <= dimensions.width; i += 50) {
      gridGroup.append('line')
        .attr('x1', i)
        .attr('y1', 0)
        .attr('x2', i)
        .attr('y2', dimensions.height)
        .attr('stroke', '#1a1a2e')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= dimensions.height; i += 50) {
      gridGroup.append('line')
        .attr('x1', 0)
        .attr('y1', i)
        .attr('x2', dimensions.width)
        .attr('y2', i)
        .attr('stroke', '#1a1a2e')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    }

    // Create central nexus hub
    const hubGroup = svg.append('g').attr('class', 'hub');
    
    hubGroup.append('circle')
      .attr('cx', dimensions.width * 0.8)
      .attr('cy', dimensions.height * 0.5)
      .attr('r', 30)
      .attr('fill', 'url(#greenGlow)')
      .attr('opacity', 0.8);
    
    hubGroup.append('text')
      .attr('x', dimensions.width * 0.8)
      .attr('y', dimensions.height * 0.5)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#00ff66')
      .attr('font-family', 'Orbitron, monospace')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('NEXUS');

    // Create wallet nodes
    const walletPositions = [
      { x: dimensions.width * 0.2, y: dimensions.height * 0.2, id: 'wallet-1' },
      { x: dimensions.width * 0.2, y: dimensions.height * 0.5, id: 'wallet-2' },
      { x: dimensions.width * 0.2, y: dimensions.height * 0.8, id: 'wallet-3' },
      { x: dimensions.width * 0.5, y: dimensions.height * 0.1, id: 'wallet-4' },
      { x: dimensions.width * 0.5, y: dimensions.height * 0.9, id: 'wallet-5' }
    ];

    const walletGroup = svg.append('g').attr('class', 'wallets');
    
    walletPositions.forEach((wallet, index) => {
      const walletNode = walletGroup.append('g');
      
      walletNode.append('circle')
        .attr('cx', wallet.x)
        .attr('cy', wallet.y)
        .attr('r', 15)
        .attr('fill', 'url(#blueGlow)')
        .attr('opacity', 0.6);
      
      walletNode.append('text')
        .attr('x', wallet.x)
        .attr('y', wallet.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#0066ff')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '8px')
        .text(`W${index + 1}`);
    });

    // Animate particles
    const animateParticles = () => {
      const particleGroup = svg.select('.particles');
      if (particleGroup.empty()) {
        svg.append('g').attr('class', 'particles');
      }

      const particles = svg.select('.particles')
        .selectAll('.particle')
        .data(activeFlows, d => d.id);

      particles.enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('r', d => d.size)
        .attr('fill', d => d.type === 'nft_royalty' ? 'url(#greenGlow)' : 'url(#blueGlow)')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('opacity', 0.8);

      particles
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('cx', d => d.targetX + (Math.random() - 0.5) * 20)
        .attr('cy', d => d.targetY + (Math.random() - 0.5) * 20)
        .attr('opacity', 0.1)
        .remove();

      particles.exit().remove();
    };

    // Start animation loop
    const animationInterval = setInterval(animateParticles, 500);

    return () => {
      clearInterval(animationInterval);
    };
  }, [activeFlows, dimensions]);

  return (
    <div className="relative w-full h-full bg-nexus-dark rounded-lg overflow-hidden">
      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 nexus-card p-4 max-w-xs z-10">
        <h4 className="font-tech font-bold text-nexus-blue mb-2">Ledger Flow Stats</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Flow:</span>
            <span className="text-nexus-green font-tech">${ledgerStats.totalFlow.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Transactions:</span>
            <span className="text-nexus-blue font-tech">{ledgerStats.transactionCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Commission:</span>
            <span className="text-nexus-purple font-tech">${ledgerStats.avgCommission.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Flow Type Legend */}
      <div className="absolute top-4 right-4 nexus-card p-4 max-w-xs z-10">
        <h4 className="font-tech font-bold text-white mb-2">Flow Types</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-green rounded-full animate-pulse"></div>
            <span className="text-gray-300">NFT Royalties</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-nexus-blue rounded-full animate-pulse"></div>
            <span className="text-gray-300">Trading Fees</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border border-nexus-green rounded-full"></div>
            <span className="text-gray-300">Nexus Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border border-nexus-blue rounded-full"></div>
            <span className="text-gray-300">Wallets</span>
          </div>
        </div>
      </div>

      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        }}
      />

      {/* Real-time Commission Feed */}
      <div className="absolute bottom-4 left-4 nexus-card p-4 max-w-md z-10 max-h-32 overflow-y-auto">
        <h4 className="font-tech font-bold text-nexus-green mb-2">Live Commission Feed</h4>
        <div className="space-y-1 text-xs">
          {commissions.slice(0, 5).map((commission, index) => (
            <motion.div
              key={commission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-1 bg-nexus-gray/30 rounded"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  commission.type === 'nft_royalty' ? 'bg-nexus-green' : 'bg-nexus-blue'
                } animate-pulse`}></div>
                <span className="text-gray-300">{commission.botId}</span>
              </div>
              <div className="text-right">
                <div className="text-nexus-green font-tech">${commission.amount.toFixed(2)}</div>
                <div className="text-gray-400 text-xs">
                  {new Date(commission.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="absolute bottom-4 right-4 nexus-card p-4 max-w-xs z-10">
        <h4 className="font-tech font-bold text-nexus-purple mb-2">Flow Performance</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Flow Rate:</span>
            <span className="text-nexus-green font-tech">
              {(ledgerStats.totalFlow / 60).toFixed(1)}/min
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Efficiency:</span>
            <span className="text-nexus-blue font-tech">94.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Latency:</span>
            <span className="text-nexus-purple font-tech">125ms</span>
          </div>
        </div>
        
        {/* Mini progress bars */}
        <div className="mt-3 space-y-1">
          <div className="w-full bg-nexus-gray rounded-full h-1">
            <div className="bg-nexus-green h-1 rounded-full animate-pulse" style={{width: '94%'}}></div>
          </div>
          <div className="w-full bg-nexus-gray rounded-full h-1">
            <div className="bg-nexus-blue h-1 rounded-full animate-pulse" style={{width: '87%'}}></div>
          </div>
          <div className="w-full bg-nexus-gray rounded-full h-1">
            <div className="bg-nexus-purple h-1 rounded-full animate-pulse" style={{width: '91%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerFlowVisualization;
