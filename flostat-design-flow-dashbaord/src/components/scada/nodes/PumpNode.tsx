import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface PumpNodeProps {
    data: {
        label: string;
        status: 'active' | 'inactive' | 'error';
        value?: number;
        unit?: string;
    };
}

const PumpNode = memo(({ data }: PumpNodeProps) => {
    const { label, status, value, unit } = data;

    const isActive = status === 'active';
    const isError = status === 'error';

    return (
        <div className="relative group">
            <div className="flex flex-col items-center">
                {/* Pump Body */}
                <div className="relative w-16 h-16">
                    {/* Base/Housing */}
                    <div
                        className="absolute inset-0 rounded-full shadow-lg"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #475569, #1e293b)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                        }}
                    ></div>

                    {/* Rotating Impeller/Fan */}
                    <div className="absolute inset-2 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                        <motion.div
                            className="w-full h-full flex items-center justify-center"
                            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Settings className={`w-8 h-8 ${isActive ? 'text-cyan-400' : isError ? 'text-red-500' : 'text-slate-500'}`} />
                        </motion.div>
                    </div>

                    {/* Status Indicator Ring */}
                    <div
                        className={`absolute -inset-1 rounded-full border-2 opacity-70 ${isActive ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : isError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-slate-600'}`}
                    ></div>
                </div>

                {/* Label Plate */}
                <div className="mt-2 px-3 py-1 bg-slate-800 text-slate-100 rounded-md border border-slate-600 text-[10px] font-bold shadow-lg tracking-wider uppercase text-center min-w-[80px]">
                    <div>{label}</div>
                    {value !== undefined && (
                        <div className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {value} {unit}
                        </div>
                    )}
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

export default PumpNode;
