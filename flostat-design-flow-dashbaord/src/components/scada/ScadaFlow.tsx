import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TankNode from './nodes/TankNode';
import PumpNode from './nodes/PumpNode';
import ValveNode from './nodes/ValveNode';
import SumpNode from './nodes/SumpNode';
import AnimatedFlowEdge from './AnimatedFlowEdge';

const nodeTypes = {
    tank: TankNode,
    pump: PumpNode,
    valve: ValveNode,
    sump: SumpNode,
};

const edgeTypes = {
    animated: AnimatedFlowEdge,
};

interface ScadaFlowProps {
    devices: any[];
}

const ScadaFlow: React.FC<ScadaFlowProps> = ({ devices }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Transform devices into nodes and edges
    useEffect(() => {
        if (!devices || devices.length === 0) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Group devices by type to determine layout
        const tanks = devices.filter((d) => d.type === 'tank');
        const pumps = devices.filter((d) => d.type === 'pump');
        const valves = devices.filter((d) => d.type === 'valve');
        const sumps = devices.filter((d) => d.type === 'sump'); // Assuming sumps exist in devices or we create a dummy one

        // Layout configuration
        const startX = 50;
        const startY = 50;
        const gapX = 300; // Increased to 300 to fix "too close" issue
        const gapY = 180; // Decreased to 180 to bring connected devices closer

        // Create Tank Nodes (Row 1)
        tanks.forEach((tank, index) => {
            newNodes.push({
                id: String(tank.id),
                type: 'tank',
                position: { x: startX + index * gapX, y: startY },
                data: {
                    label: tank.name,
                    level: tank.value || 0,
                    status: tank.status,
                },
            });
        });

        // Create Pump Nodes (Row 2)
        pumps.forEach((pump, index) => {
            // Try to align with a tank if possible, otherwise just list them
            newNodes.push({
                id: String(pump.id),
                type: 'pump',
                position: { x: startX + index * gapX, y: startY + gapY },
                data: {
                    label: pump.name,
                    status: pump.status,
                    value: pump.value,
                    unit: pump.unit,
                },
            });
        });

        // Create Valve Nodes (Row 3)
        valves.forEach((valve, index) => {
            newNodes.push({
                id: String(valve.id),
                type: 'valve',
                position: { x: startX + index * gapX, y: startY + gapY * 2 },
                data: {
                    label: valve.name,
                    status: valve.status,
                    isOpen: valve.isOn,
                },
            });
        });

        // Create Sump Nodes (Row 4)
        // If no sumps in devices, maybe add a dummy one if needed, but for now only use real devices
        sumps.forEach((sump, index) => {
            newNodes.push({
                id: String(sump.id),
                type: 'sump',
                position: { x: startX + index * gapX, y: startY + gapY * 3 },
                data: {
                    label: sump.name,
                    level: sump.value || 50,
                }
            })
        })


        // Create Edges (Logic to connect them)
        // This is a simplified logic. In a real app, you'd have connectivity data.
        // Here we'll connect Tank -> Pump -> Valve -> Sump (if available) based on index or block

        // Connect Tanks to Pumps
        tanks.forEach((tank, i) => {
            // Find a pump in the same block if possible
            const pump = pumps.find(p => p.block === tank.block) || pumps[i % pumps.length];
            if (pump) {
                const isFlowing = tank.status === 'active' && pump.status === 'active';
                newEdges.push({
                    id: `e-${tank.id}-${pump.id}`,
                    source: String(tank.id),
                    target: String(pump.id),
                    type: 'animated',
                    animated: true, // Standard animated edge fallback
                    data: { isFlowing },
                    style: { stroke: isFlowing ? 'var(--aqua)' : '#555', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: isFlowing ? 'var(--aqua)' : '#555' },
                });
            }
        });

        // Connect Pumps to Valves
        pumps.forEach((pump, i) => {
            const valve = valves.find(v => v.block === pump.block) || valves[i % valves.length];
            if (valve) {
                const isFlowing = pump.status === 'active' && valve.status === 'active';
                newEdges.push({
                    id: `e-${pump.id}-${valve.id}`,
                    source: String(pump.id),
                    target: String(valve.id),
                    type: 'animated',
                    data: { isFlowing },
                    style: { stroke: isFlowing ? 'var(--aqua)' : '#555', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: isFlowing ? 'var(--aqua)' : '#555' },
                });
            }
        });

        // Connect Valves to Sumps (if any)
        valves.forEach((valve, i) => {
            const sump = sumps[i % sumps.length];
            if (sump) {
                const isFlowing = valve.status === 'active';
                newEdges.push({
                    id: `e-${valve.id}-${sump.id}`,
                    source: String(valve.id),
                    target: String(sump.id),
                    type: 'animated',
                    data: { isFlowing },
                    style: { stroke: isFlowing ? 'var(--aqua)' : '#555', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: isFlowing ? 'var(--aqua)' : '#555' },
                });
            }
        })

        setNodes(newNodes);
        setEdges(newEdges);
    }, [devices, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Industrial Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                attributionPosition="bottom-right"
                className="bg-transparent"
            >
                <Background color="#334155" gap={20} size={1} style={{ opacity: 0.2 }} />
                <Controls className="bg-slate-800 border-slate-700 text-slate-200 fill-slate-200" />
            </ReactFlow>
        </div>
    );
};

export default ScadaFlow;
