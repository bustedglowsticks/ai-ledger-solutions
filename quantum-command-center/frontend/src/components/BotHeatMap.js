/*
 * 🚀 BOT HEAT MAP - TradingView Style Visualization
 * Professional stock market heat map with D3.js
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BotHeatMap = ({ bots, onBotSelect }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!bots || bots.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Prepare data for treemap
    const data = {
      name: "root",
      children: bots.map(bot => ({
        name: bot.name || `Bot ${bot.id}`,
        value: Math.max(bot.yield || 0, 10), // Size by yield, minimum 10
        yield: bot.yield || 0,
        volatility: bot.volatility || 0,
        commissions: bot.commissions || 0,
        status: bot.status || 'unknown',
        owner: bot.owner || 'Unknown',
        bot: bot
      }))
    };

    // Create treemap layout
    const treemap = d3.treemap()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .padding(2);

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    // Color scale based on yield performance
    const colorScale = d3.scaleSequential()
      .domain([0, 100])
      .interpolator(d3.interpolateRdYlGn);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create rectangles for each bot
    const leaf = g.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Bot rectangles
    leaf.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.yield))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Hover effect
        d3.select(this)
          .attr("stroke", "#2563eb")
          .attr("stroke-width", 3);

        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 5px;">${d.data.name}</div>
          <div>Yield: <span style="color: #4ade80;">${d.data.yield.toFixed(1)}%</span></div>
          <div>Volatility: <span style="color: #f59e0b;">${(d.data.volatility * 100).toFixed(1)}%</span></div>
          <div>Commissions: <span style="color: #fbbf24;">${d.data.commissions.toFixed(2)} XRP</span></div>
          <div>Status: <span style="color: ${d.data.status === 'active' ? '#4ade80' : '#ef4444'};">${d.data.status}</span></div>
          ${d.data.owner !== 'Unknown' ? `<div>Owner: ${d.data.owner}</div>` : ''}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        d3.selectAll(".tooltip").remove();
      })
      .on("click", function(event, d) {
        onBotSelect(d.data.bot);
      });

    // Bot labels
    leaf.append("text")
      .attr("x", 4)
      .attr("y", 16)
      .text(d => d.data.name)
      .attr("font-size", d => {
        const width = d.x1 - d.x0;
        return Math.min(12, width / 8);
      })
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
      .style("pointer-events", "none");

    // Yield percentage
    leaf.append("text")
      .attr("x", 4)
      .attr("y", d => (d.y1 - d.y0) / 2 + 5)
      .text(d => `${d.data.yield.toFixed(1)}%`)
      .attr("font-size", d => {
        const width = d.x1 - d.x0;
        return Math.min(14, width / 6);
      })
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
      .style("pointer-events", "none");

    // Commission amount
    leaf.append("text")
      .attr("x", 4)
      .attr("y", d => (d.y1 - d.y0) - 8)
      .text(d => `${d.data.commissions.toFixed(1)} XRP`)
      .attr("font-size", d => {
        const width = d.x1 - d.x0;
        return Math.min(10, width / 10);
      })
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-weight", "500")
      .style("pointer-events", "none");

    // Status indicator
    leaf.append("circle")
      .attr("cx", d => (d.x1 - d.x0) - 12)
      .attr("cy", 12)
      .attr("r", 4)
      .attr("fill", d => {
        switch(d.data.status) {
          case 'active': return '#4ade80';
          case 'paused': return '#fbbf24';
          default: return '#ef4444';
        }
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("pointer-events", "none");

  }, [bots, onBotSelect]);

  if (!bots || bots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <p>No bots available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-auto border border-gray-200 rounded-lg bg-gray-50"></svg>
      <div className="mt-4 text-sm text-gray-600">
        <p>💡 <strong>Heat Map Guide:</strong> Rectangle size = yield amount, color = performance (green = high yield, red = low yield). Click rectangles for details.</p>
      </div>
    </div>
  );
};

export default BotHeatMap;
