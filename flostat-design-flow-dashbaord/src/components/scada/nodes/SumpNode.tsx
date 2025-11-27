import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface SumpNodeProps {
    data: {
        label: string;
        level: number;
    };
}

const SumpNode = memo(({ data }: SumpNodeProps) => {
    const { label, level } = data;

    return (
        <div className="relative group">
            <div className="flex flex-col items-center">
                {/* Sump Pit - Concrete Look */}
                <div
                    className="relative w-40 h-20 overflow-hidden rounded-b-xl shadow-inner border-x-4 border-b-4 border-stone-400"
                    style={{
                        background: 'linear-gradient(to bottom, #292524, #1c1917)',
                        boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Concrete Texture */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

                    {/* Water Level */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 w-full"
                        style={{
                            background: 'linear-gradient(180deg, rgba(6,182,212,0.6) 0%, rgba(8,145,178,0.8) 100%)',
                            boxShadow: '0 0 20px rgba(6,182,212,0.3)'
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${level}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    >
                        {/* Surface Waves */}
                        <div className="absolute top-0 left-0 right-0 h-2 opacity-50">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                                <motion.path
                                    d="M0,10 Q50,0 100,10 T200,10 V20 H0 Z"
                                    fill="rgba(255,255,255,0.3)"
                                    animate={{ d: ["M0,10 Q50,0 100,10 T200,10 V20 H0 Z", "M0,10 Q50,20 100,10 T200,10 V20 H0 Z", "M0,10 Q50,0 100,10 T200,10 V20 H0 Z"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Depth Markers */}
                    <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-2 text-[8px] font-mono text-stone-500">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0%</span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-sm font-bold text-white drop-shadow-md">
                            {level}%
                        </span>
                    </div>
                </div>

                {/* Label Plate */}
                <div className="mt-2 px-3 py-1 bg-stone-800 text-stone-200 rounded border border-stone-600 text-[10px] font-bold shadow-sm uppercase tracking-wider">
                    {label}
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-stone-400 !border-2 !border-stone-600"
            />
        </div>
    );
});

export default SumpNode;
