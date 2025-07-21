import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';

const EliteHeatMap = ({ bots, selectedBot, setSelectedBot, viewMode, filterCategory, godMode }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

  // Filter bots based on category
  const filteredBots = filterCategory === 'all' 
    ? bots 
    : bots.filter(bot => bot.category === filterCategory);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 40, height: Math.max(height - 40, 400) });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3.js Heat Map Implementation
  useEffect(() => {
    if (!filteredBots.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scales
    const yieldColorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0, d3.max(filteredBots, d => d.yield)]);

    const volatilityColorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([0, d3.max(filteredBots, d => d.volatility)]);

    // Size scale based on yield
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(filteredBots, d => d.yield)])
      .range([30, 120]);

    if (viewMode === '2d') {
      // 2D Grid Layout (Finviz-style)
      const cols = Math.ceil(Math.sqrt(filteredBots.length));
      const rows = Math.ceil(filteredBots.length / cols);
      const cellWidth = innerWidth / cols;
      const cellHeight = innerHeight / rows;

      // Create bot tiles
      const tiles = g.selectAll('.bot-tile')
        .data(filteredBots)
        .enter()
        .append('g')
        .attr('class', 'bot-tile')
        .attr('transform', (d, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return `translate(${col * cellWidth + cellWidth/2}, ${row * cellHeight + cellHeight/2})`;
        });

      // Add tile rectangles
      tiles.append('rect')
        .attr('x', d => -sizeScale(d.yield) / 2)
        .attr('y', d => -sizeScale(d.yield) / 2)
        .attr('width', d => sizeScale(d.yield))
        .attr('height', d => sizeScale(d.yield))
        .attr('rx', 12)
        .attr('fill', d => yieldColorScale(d.yield))
        .attr('stroke', d => d.ecoScore > 85 ? '#10b981' : '#e5e7eb')
        .attr('stroke-width', d => d.ecoScore > 85 ? 3 : 1)
        .attr('opacity', 0.9)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', 3);

          setTooltip({
            visible: true,
            x: event.pageX + 10,
            y: event.pageY - 10,
            data: d
          });
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9)
            .attr('stroke-width', d => d.ecoScore > 85 ? 3 : 1);

          setTooltip({ visible: false, x: 0, y: 0, data: null });
        })
        .on('click', (event, d) => {
          setSelectedBot(d);
        });

      // Add bot names
      tiles.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1f2937')
        .text(d => d.name.split(' ')[0]);

      // Add yield percentage
      tiles.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#1f2937')
        .text(d => `${d.yield}%`);

      // Add status indicators
      tiles.append('circle')
        .attr('cx', d => sizeScale(d.yield) / 2 - 10)
        .attr('cy', d => -sizeScale(d.yield) / 2 + 10)
        .attr('r', 6)
        .attr('fill', d => d.status === 'active' ? '#22c55e' : '#f59e0b')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Add eco-RWA glow for high eco scores
      tiles.filter(d => d.ecoScore > 85)
        .append('circle')
        .attr('r', d => sizeScale(d.yield) / 2 + 10)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .style('filter', 'drop-shadow(0 0 10px #10b981)');

    } else {
      // 3D Galaxy Mode (Circular layout with orbits)
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const maxRadius = Math.min(innerWidth, innerHeight) / 3;

      // Create orbital rings based on yield performance
      const yieldRanges = [
        { min: 80, max: 100, radius: maxRadius * 0.4, color: '#10b981' },
        { min: 60, max: 80, radius: maxRadius * 0.6, color: '#22c55e' },
        { min: 40, max: 60, radius: maxRadius * 0.8, color: '#eab308' },
        { min: 0, max: 40, radius: maxRadius, color: '#ef4444' }
      ];

      // Draw orbital rings
      yieldRanges.forEach(ring => {
        g.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', ring.radius)
          .attr('fill', 'none')
          .attr('stroke', ring.color)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.3);
      });

      // Position bots in orbital rings
      filteredBots.forEach((bot, i) => {
        const ring = yieldRanges.find(r => bot.yield >= r.min && bot.yield < r.max) || yieldRanges[yieldRanges.length - 1];
        const angle = (i / filteredBots.length) * 2 * Math.PI;
        bot.x = centerX + Math.cos(angle) * ring.radius;
        bot.y = centerY + Math.sin(angle) * ring.radius;
      });

      // Create bot nodes
      const nodes = g.selectAll('.bot-node')
        .data(filteredBots)
        .enter()
        .append('g')
        .attr('class', 'bot-node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

      // Add bot circles
      nodes.append('circle')
        .attr('r', d => sizeScale(d.yield) / 3)
        .attr('fill', d => yieldColorScale(d.yield))
        .attr('stroke', d => d.ecoScore > 85 ? '#10b981' : '#e5e7eb')
        .attr('stroke-width', d => d.ecoScore > 85 ? 3 : 1)
        .attr('opacity', 0.9)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(d.yield) / 2.5)
            .attr('opacity', 1);

          setTooltip({
            visible: true,
            x: event.pageX + 10,
            y: event.pageY - 10,
            data: d
          });
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(d.yield) / 3)
            .attr('opacity', 0.9);

          setTooltip({ visible: false, x: 0, y: 0, data: null });
        })
        .on('click', (event, d) => {
          setSelectedBot(d);
        });

      // Add connection lines to center (commission flows)
      nodes.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d => centerX - d.x)
        .attr('y2', d => centerY - d.y)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.4)
        .attr('class', 'commission-flow-line');

      // Add central master node
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 30)
        .attr('fill', 'url(#masterGradient)')
        .attr('stroke', '#fbbf24')
        .attr('stroke-width', 3)
        .style('filter', 'drop-shadow(0 0 20px #fbbf24)');

      // Add gradient definition
      const defs = svg.append('defs');
      const gradient = defs.append('radialGradient')
        .attr('id', 'masterGradient');
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#fbbf24');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#f59e0b');

      // Add master crown
      g.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .text('👑');
    }

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 150}, 20)`);

    legend.append('rect')
      .attr('width', 140)
      .attr('height', 120)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#e5e7eb')
      .attr('rx', 8);

    legend.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Legend');

    // Yield color legend
    const yieldLegend = legend.append('g').attr('transform', 'translate(10, 35)');
    yieldLegend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#22c55e');
    yieldLegend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('font-size', '10px')
      .text('High Yield');

    // Eco-RWA legend
    const ecoLegend = legend.append('g').attr('transform', 'translate(10, 55)');
    ecoLegend.append('circle')
      .attr('cx', 7.5)
      .attr('cy', 7.5)
      .attr('r', 7.5)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2);
    ecoLegend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('font-size', '10px')
      .text('Eco-RWA');

    // Status legend
    const statusLegend = legend.append('g').attr('transform', 'translate(10, 75)');
    statusLegend.append('circle')
      .attr('cx', 7.5)
      .attr('cy', 7.5)
      .attr('r', 4)
      .attr('fill', '#22c55e');
    statusLegend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('font-size', '10px')
      .text('Active');

    statusLegend.append('circle')
      .attr('cx', 7.5)
      .attr('cy', 22.5)
      .attr('r', 4)
      .attr('fill', '#f59e0b');
    statusLegend.append('text')
      .attr('x', 20)
      .attr('y', 27)
      .attr('font-size', '10px')
      .text('Paused');

  }, [filteredBots, dimensions, viewMode, selectedBot]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="absolute z-50 bg-black/90 text-white p-3 rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tooltip-arrow"></div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm">{tooltip.data.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-300">Yield:</span>
                <span className="text-green-400 font-bold ml-1">{tooltip.data.yield}%</span>
              </div>
              <div>
                <span className="text-gray-300">Vol:</span>
                <span className="text-yellow-400 ml-1">{(tooltip.data.volatility * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-300">Comm:</span>
                <span className="text-blue-400 font-bold ml-1">${tooltip.data.commissions}</span>
              </div>
              <div>
                <span className="text-gray-300">Eco:</span>
                <span className="text-green-300 ml-1">{tooltip.data.ecoScore}/100</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Admin: {tooltip.data.adminName}
            </div>
            {tooltip.data.ecoScore > 85 && (
              <div className="text-xs text-green-400 font-bold">
                🌱 +{tooltip.data.rwaBonus}% RWA Bonus
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {['all', 'liquidity-provider', 'arbitrage', 'amm-provider', 'eco-rwa'].map(category => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterCategory === category
                ? 'bg-apple-blue-600 text-white'
                : 'bg-white/80 text-apple-gray-700 hover:bg-white'
            }`}
          >
            {category === 'all' ? 'All Bots' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Selected Bot Details */}
      {selectedBot && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-apple-gray-900">{selectedBot.name}</h3>
            <button
              onClick={() => setSelectedBot(null)}
              className="text-apple-gray-500 hover:text-apple-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-apple-gray-600">Yield:</span>
              <span className="font-bold text-yield-green-600">{selectedBot.yield}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-apple-gray-600">Volatility:</span>
              <span className="text-volatility-red-600">{(selectedBot.volatility * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-apple-gray-600">Commissions:</span>
              <span className="font-bold text-apple-blue-600">${selectedBot.commissions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-apple-gray-600">Eco Score:</span>
              <span className="text-yield-green-600">{selectedBot.ecoScore}/100</span>
            </div>
            {selectedBot.rwaBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-apple-gray-600">RWA Bonus:</span>
                <span className="font-bold text-yield-green-600">+{selectedBot.rwaBonus}%</span>
              </div>
            )}
            <div className="pt-2 border-t border-apple-gray-200">
              <div className="text-xs text-apple-gray-500">
                Admin: {selectedBot.adminName}
              </div>
              <div className="text-xs text-apple-gray-500">
                Last TX: {new Date(selectedBot.lastTransaction).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EliteHeatMap;
