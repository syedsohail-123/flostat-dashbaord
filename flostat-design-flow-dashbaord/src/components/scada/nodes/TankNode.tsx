import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface TankNodeProps {
    data: {
        label: string;
        level: number;
        status: 'active' | 'inactive' | 'error' | 'warning';
        capacity?: number;
    };
}

const TankNode = memo(({ data }: TankNodeProps) => {
    const { label, level, status } = data;

    // Status color for the LED/Indicator
    const getStatusColor = () => {
        switch (status) {
            case 'error': return '#ef4444'; // Red
            case 'warning': return '#f59e0b'; // Amber
            case 'active': return '#22c55e'; // Green
            default: return '#94a3b8'; // Slate
        }
    };

    return (
        <div className="relative group">
            <div className="flex flex-col items-center">
                {/* Tank Body - Stainless Steel Look */}
                <div
                    className="relative w-24 h-36 overflow-hidden rounded-lg shadow-xl"
                    style={{
                        background: 'linear-gradient(90deg, #94a3b8 0%, #e2e8f0 20%, #cbd5e1 45%, #64748b 50%, #cbd5e1 55%, #e2e8f0 80%, #94a3b8 100%)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 5px 5px 15px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Metallic Texture Overlay */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .3) 25%, rgba(255, 255, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .3) 75%, rgba(255, 255, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>

                    {/* Liquid Level Window */}
                    <div className="absolute top-4 bottom-4 left-4 right-4 bg-slate-900/50 rounded border border-slate-400/30 overflow-hidden backdrop-blur-sm shadow-inner">
                        {/* Liquid */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 w-full"
                            style={{
                                background: 'linear-gradient(90deg, rgba(6,182,212,0.8) 0%, rgba(34,211,238,0.9) 50%, rgba(6,182,212,0.8) 100%)',
                                boxShadow: '0 0 10px rgba(6,182,212,0.5)'
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${level}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        >
                            {/* Surface reflection */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30"></div>
                        </motion.div>

                        {/* Bubbles Animation (only if active) */}
                        {status === 'active' && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute bg-white/40 rounded-full"
                                        style={{
                                            width: Math.random() * 4 + 2,
                                            height: Math.random() * 4 + 2,
                                            left: `${Math.random() * 100}%`,
                                            bottom: -10,
                                        }}
                                        animate={{
                                            y: -140,
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: Math.random() * 2 + 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                            ease: "linear",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Measurement Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 opacity-50 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-full h-px bg-white/30"></div>
                            ))}
                        </div>
                    </div>

                    {/* Status LED */}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                        style={{ backgroundColor: getStatusColor(), boxShadow: `0 0 8px ${getStatusColor()}` }}>
                    </div>
                </div>

                {/* Label Plate */}
                <div className="mt-[-10px] z-10 px-3 py-1 bg-slate-800 text-slate-100 rounded-md border border-slate-600 text-[10px] font-bold shadow-lg tracking-wider uppercase">
                    {label}
                </div>

                {/* Digital Readout */}
                <div className="mt-1 font-mono text-[10px] font-bold text-cyan-400 bg-black/80 px-2 py-0.5 rounded border border-cyan-900/50 shadow-sm">
                    {level.toFixed(1)}%
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-slate-400 !border-2 !border-slate-600"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-slate-400 !border-2 !border-slate-600"
            />
        </div>
    );
});

export default TankNode;
