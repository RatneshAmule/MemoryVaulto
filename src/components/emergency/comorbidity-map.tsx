'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ConditionItem } from '@/stores/app-store';

interface ComorbidityMapProps {
  conditions: ConditionItem[];
}

interface Connection {
  from: string;
  to: string;
  risk: 'high' | 'moderate';
  label: string;
}

const KNOWN_CONNECTIONS: Connection[] = [
  { from: 'diabetes', to: 'hypertension', risk: 'high', label: 'Metabolic syndrome cluster' },
  { from: 'diabetes', to: 'obesity', risk: 'high', label: 'Metabolic' },
  { from: 'hypertension', to: 'atrial fibrillation', risk: 'high', label: 'Cardiovascular' },
  { from: 'hypertension', to: 'a-fib', risk: 'high', label: 'Cardiovascular' },
  { from: 'atrial fibrillation', to: 'prior myocardial infarction', risk: 'high', label: 'Cardiac event chain' },
  { from: 'a-fib', to: 'prior myocardial infarction', risk: 'high', label: 'Cardiac event chain' },
  { from: 'atrial fibrillation', to: 'heart failure', risk: 'high', label: 'Cardiac progression' },
  { from: 'obesity', to: 'hypertension', risk: 'moderate', label: 'Cardiovascular risk' },
  { from: 'diabetes', to: 'prior myocardial infarction', risk: 'high', label: 'Accelerated atherosclerosis' },
  { from: 'diabetes', to: 'heart failure', risk: 'moderate', label: 'Diabetic cardiomyopathy' },
  { from: 'copd', to: 'asthma', risk: 'moderate', label: 'Respiratory comorbidity' },
  { from: 'hypertension', to: 'heart failure', risk: 'high', label: 'Pressure overload' },
  { from: 'obesity', to: 'diabetes', risk: 'high', label: 'Insulin resistance' },
  { from: 'epilepsy', to: 'dravet syndrome', risk: 'high', label: 'Seizure spectrum' },
];

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

export function ComorbidityMap({ conditions }: ComorbidityMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const activeConditions = conditions.filter(c => c.status === 'active');

  const normalizedNames = useMemo(
    () => activeConditions.map(c => normalize(c.name)),
    [conditions]
  );

  const relevantConnections = useMemo(() => {
    return KNOWN_CONNECTIONS.filter(conn => {
      const fromMatch = normalizedNames.some(n =>
        n.includes(conn.from) || conn.from.includes(n)
      );
      const toMatch = normalizedNames.some(n =>
        n.includes(conn.to) || conn.to.includes(n)
      );
      return fromMatch && toMatch;
    });
  }, [normalizedNames]);

  const nodeCount = activeConditions.length;
  const centerX = 150;
  const centerY = 130;
  const radius = Math.min(100, 40 + nodeCount * 10);

  const nodesWithPositions = useMemo(() => {
    return activeConditions.map((condition, i) => {
      const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
      return {
        condition,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        normalizedName: normalize(condition.name),
      };
    });
  }, [activeConditions, nodeCount, radius]);

  const lines = useMemo(() => {
    return relevantConnections.map(conn => {
      const fromNode = nodesWithPositions.find(n =>
        n.normalizedName.includes(conn.from) || conn.from.includes(n.normalizedName)
      );
      const toNode = nodesWithPositions.find(n =>
        n.normalizedName.includes(conn.to) || conn.to.includes(n.normalizedName)
      );
      if (!fromNode || !toNode) return null;
      return {
        ...conn,
        x1: fromNode.x,
        y1: fromNode.y,
        x2: toNode.x,
        y2: toNode.y,
      };
    }).filter(Boolean);
  }, [relevantConnections, nodesWithPositions]);

  if (activeConditions.length < 2) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center text-sm text-slate-500">
        Need at least 2 active conditions to display comorbidity map
      </div>
    );
  }

  const selectedCondition = selectedNode
    ? activeConditions.find(c => c.id === selectedNode)
    : null;

  const selectedConnections = selectedNode
    ? relevantConnections.filter(conn => {
        const selNorm = normalize(selectedCondition?.name || '');
        return selNorm.includes(conn.from) || conn.from.includes(selNorm) ||
               selNorm.includes(conn.to) || conn.to.includes(selNorm);
      })
    : [];

  return (
    <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
      <div className="p-3 border-b border-slate-700/50">
        <h4 className="text-sm font-medium text-slate-300">Comorbidity Risk Map</h4>
        <p className="text-xs text-slate-500">Click a node to see interaction details</p>
      </div>

      <svg width="300" height="260" viewBox="0 0 300 260" className="w-full">
        {lines.map((line, i) => (
          <motion.line
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: i * 0.1 }}
            x1={line!.x1} y1={line!.y1}
            x2={line!.x2} y2={line!.y2}
            stroke={line!.risk === 'high' ? '#ef4444' : '#f59e0b'}
            strokeWidth={2}
            strokeDasharray={line!.risk === 'high' ? '0' : '4 2'}
          />
        ))}

        {nodesWithPositions.map((node, i) => (
          <g key={node.condition.id} onClick={() => setSelectedNode(selectedNode === node.condition.id ? null : node.condition.id)}>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              cx={node.x} cy={node.y}
              r={selectedNode === node.condition.id ? 22 : 18}
              fill={selectedNode === node.condition.id ? '#dc2626' : '#1e293b'}
              stroke={selectedNode === node.condition.id ? '#fca5a5' : '#475569'}
              strokeWidth={2}
              className="cursor-pointer"
            />
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 + 0.2 }}
              x={node.x} y={node.y + 4}
              textAnchor="middle"
              fill={selectedNode === node.condition.id ? '#fff' : '#e2e8f0'}
              fontSize="8"
              fontWeight="600"
              className="pointer-events-none"
            >
              {node.condition.name.length > 14
                ? node.condition.name.slice(0, 12) + '…'
                : node.condition.name}
            </motion.text>
          </g>
        ))}
      </svg>

      {selectedCondition && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 border-t border-slate-700/50"
        >
          <p className="text-sm font-medium text-white mb-1">{selectedCondition.name}</p>
          {selectedConnections.length > 0 ? (
            <div className="space-y-1">
              {selectedConnections.map((conn, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${conn.risk === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-400">{conn.label}</span>
                  <span className={`px-1 py-0.5 rounded text-[10px] ${
                    conn.risk === 'high' ? 'bg-red-950/50 text-red-300' : 'bg-amber-950/50 text-amber-300'
                  }`}>
                    {conn.risk} interaction
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No known interactions with other active conditions</p>
          )}
          {selectedCondition.diagnosedDate && (
            <p className="text-xs text-slate-500 mt-1">Diagnosed: {selectedCondition.diagnosedDate}</p>
          )}
        </motion.div>
      )}

      <div className="px-3 pb-3 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> High risk
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500 inline-block border-dashed" /> Moderate
        </div>
      </div>
    </div>
  );
}
