'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  from: string;
  to: string;
  type: string;
}

interface GraphData {
  nodes: Omit<Node, 'x' | 'y' | 'vx' | 'vy'>[];
  edges: Edge[];
}

interface Props {
  data: GraphData | null;
  loading?: boolean;
}

export function GraphVisualization({ data, loading }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Simulation constants
  const REPULSION = 500;
  const SPRING_LENGTH = 150;
  const SPRING_STRENGTH = 0.05;
  const DAMPING = 0.9;
  const CENTER_STRENGTH = 0.01;

  // Initialize nodes with random positions
  useEffect(() => {
    if (!data) return;
    
    // Preserve positions if re-rendering same nodes, otherwise randomize
    const width = svgRef.current?.clientWidth || 800;
    const height = svgRef.current?.clientHeight || 600;

    const newNodes = data.nodes.map(n => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0
    }));

    setNodes(newNodes);
  }, [data]);

  // Run Simulation
  useEffect(() => {
    if (!nodes.length || !data) return;

    const edges = data.edges;
    const width = svgRef.current?.clientWidth || 800;
    const height = svgRef.current?.clientHeight || 600;

    const animate = () => {
      setNodes(prevNodes => {
        const nextNodes = prevNodes.map(n => ({ ...n }));
        
        // 1. Repulsion (Nodes repel each other)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const dx = nextNodes[i].x - nextNodes[j].x;
            const dy = nextNodes[i].y - nextNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = REPULSION / (distance * distance);
            
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            nextNodes[i].vx += fx;
            nextNodes[i].vy += fy;
            nextNodes[j].vx -= fx;
            nextNodes[j].vy -= fy;
          }
        }

        // 2. Attraction (Edges pull nodes together)
        edges.forEach(edge => {
          const source = nextNodes.find(n => n.id === edge.from);
          const target = nextNodes.find(n => n.id === edge.to);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = distance - SPRING_LENGTH;
            const force = displacement * SPRING_STRENGTH;

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Center Gravity & Damping
        nextNodes.forEach(node => {
          // Pull to center
          node.vx += (width / 2 - node.x) * CENTER_STRENGTH;
          node.vy += (height / 2 - node.y) * CENTER_STRENGTH;

          // Apply velocity
          node.x += node.vx;
          node.y += node.vy;

          // Apply damping (friction)
          node.vx *= DAMPING;
          node.vy *= DAMPING;
          
          // Limits
          node.x = Math.max(20, Math.min(width - 20, node.x));
          node.y = Math.max(20, Math.min(height - 20, node.y));
        });

        // Stop simulation if energy is low (optimization)
        const totalEnergy = nextNodes.reduce((acc, n) => acc + Math.abs(n.vx) + Math.abs(n.vy), 0);
        if (totalEnergy < 0.5) {
             // can stop here
        }
        
        return nextNodes;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [data]); // Re-run when data changes (initially), then state updates handle the loop. 
  
  // NOTE: The above useEffect has a dependency on `data` but mainly runs loops on `setNodes`.
  // To avoid infinite changing dependency loop, we only trigger it once or manage strictly.
  // Actually, standard React loop: update state -> render -> effect -> update state... causes 60fps re-renders.
  // Ideally we decouple simulation from render, or use d3 which manipulates DOM directly.
  // For this pure React version, 60fps state updates is heavy but workable for small graphs (<50 nodes).

  // Interactive Dragging
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleMouseDown = (id: string) => {
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && svgRef.current) {
        const CTM = svgRef.current.getScreenCTM();
        if (CTM) {
            const x = (e.clientX - CTM.e) / CTM.a;
            const y = (e.clientY - CTM.f) / CTM.d;
            
            setNodes(prev => prev.map(n => 
                n.id === draggingId ? { ...n, x: x / zoom, y: y / zoom, vx: 0, vy: 0 } : n
            ));
        }
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  if (loading) {
      return (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 rounded-xl border border-gray-100 min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-gray-500">Generating Graph...</span>
          </div>
      );
  }

  if (!data || nodes.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 rounded-xl border border-gray-100 min-h-[400px] text-gray-400">
            Select a document to visualize the knowledge graph.
        </div>
      );
  }

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 z-10">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1 hover:bg-gray-100 rounded" title="Zoom In"><ZoomIn className="h-4 w-4 text-gray-600" /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-1 hover:bg-gray-100 rounded" title="Zoom Out"><ZoomOut className="h-4 w-4 text-gray-600" /></button>
        <button onClick={() => setZoom(1)} className="p-1 hover:bg-gray-100 rounded" title="Reset"><RefreshCw className="h-4 w-4 text-gray-600" /></button>
      </div>

      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-move"
        viewBox={`0 0 ${800} ${600}`} 
      >
        <g transform={`scale(${zoom})`}>
          {/* Edges */}
          {(() => {
              // Pre-process edges to find parallels
              const edgeGroups = new Map<string, number>();
              
              return data.edges.map((edge, i) => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                // Create a unique key for the pair (sorted so A-B and B-A share key)
                const pairKey = [edge.from, edge.to].sort().join('-');
                const count = edgeGroups.get(pairKey) || 0;
                edgeGroups.set(pairKey, count + 1);

                // Calculate curvature based on index
                // 0 -> 0 (straight)
                // 1 -> 50
                // 2 -> -50
                // 3 -> 100
                // 4 -> -100
                const curveAmount = count === 0 ? 0 : (Math.ceil(count / 2) * 50 * (count % 2 === 0 ? -1 : 1));
                
                // Calculate control point
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const normalX = -dy / dist;
                const normalY = dx / dist;

                const cpX = midX + normalX * curveAmount;
                const cpY = midY + normalY * curveAmount;

                // Label Position (at peak of curve)
                // For a quadratic bezier, the t=0.5 point is: (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
                // At t=0.5: 0.25*P0 + 0.5*P1 + 0.25*P2 = (P0 + 2*P1 + P2)/4
                const labelX = (source.x + 2 * cpX + target.x) / 4;
                const labelY = (source.y + 2 * cpY + target.y) / 4;

                return (
                  <g key={`${edge.from}-${edge.to}-${i}`}>
                    <path 
                        d={`M ${source.x} ${source.y} Q ${cpX} ${cpY} ${target.x} ${target.y}`}
                        stroke="#94a3b8" 
                        fill="transparent"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                    />
                    <text 
                        x={labelX} 
                        y={labelY} 
                        textAnchor="middle" 
                        className="text-[10px] fill-gray-500 font-mono bg-white/80 px-1 rounded"
                        style={{ textShadow: "0px 0px 4px white" }}
                    >
                        {edge.type}
                    </text>
                  </g>
                );
              });
          })()}

          {/* Nodes */}
          {nodes.map((node) => (
            <g 
                key={node.id} 
                transform={`translate(${node.x},${node.y})`}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(node.id); }}
                className="cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
            >
              <circle r="25" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
              <text dy="5" textAnchor="middle" className="text-xs fill-indigo-900 font-semibold pointer-events-none select-none">
                  {node.name.length > 10 ? node.name.substring(0, 9) + '...' : node.name}
              </text>
              <title>{node.name}\n{node.description}</title>
            </g>
          ))}
        </g>
        
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-gray-100 shadow-sm text-xs text-gray-600">
          <p className="font-semibold mb-1">Legend</p>
          <div className="flex items-center gap-2 max-w-[200px] flex-wrap"> 
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Concept</span>
             <span className="flex items-center gap-1"><span className="w-4 h-[1px] bg-slate-400"></span> Relationship</span>
          </div>
      </div>
    </div>
  );
}
