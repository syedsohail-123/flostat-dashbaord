import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface ValveNodeProps {
    data: {
        label: string;
        status: 'active' | 'inactive' | 'error';
        isOpen: boolean;
    };
}

const ValveNode = memo(({ data }: ValveNodeProps) => {
    const { label, status, isOpen } = data;

    const isActive = status === 'active' || isOpen;
    const isError = status === 'error';

    return (
        <div className="relative group">
            <div className="flex flex-col items-center">
                {/* Valve Body */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                    {/* Pipe Connector Background */}
                    <div className="absolute w-full h-4 bg-slate-600 rounded-sm top-1/2 -translate-y-1/2 shadow-inner"></div>

                    {/* Valve Body Center */}
                    <div
                        className="absolute w-8 h-8 rounded bg-slate-700 border border-slate-500 shadow-md flex items-center justify-center z-10"
                        style={{
                            background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
                        }}
                    >
                        {/* Status Light */}
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : isError ? 'bg-red-500' : 'bg-slate-900'}`}></div>
                    </div>

                    {/* Valve Handle (Wheel) */}
                    <motion.div
                        className="absolute -top-3 z-20 w-10 h-10 rounded-full border-4 border-red-700 bg-transparent shadow-lg"
                        style={{
                            background: 'radial-gradient(transparent 40%, #b91c1c 40%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                        }}
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Spokes */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-red-700 -translate-y-1/2"></div>
                        <div className="absolute top-0 left-1/2 w-1 h-full bg-red-700 -translate-x-1/2"></div>
                    </motion.div>
                </div>

                {/* Label Plate */}
                <div className="mt-2 px-2 py-0.5 bg-slate-800 text-slate-100 rounded border border-slate-600 text-[10px] font-bold shadow-sm uppercase tracking-wide">
                    {label}
                </div>

                {/* State Text */}
                <div className={`text-[9px] font-bold mt-0.5 ${isOpen ? 'text-green-500' : 'text-slate-500'}`}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
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

export default ValveNode;
