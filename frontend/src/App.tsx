import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import { TopBar, type SaveStatus } from './components/TopBar';
import { LeftDrawer } from './components/LeftDrawer';
import { RightPanel, type SelectedNodeInfo } from './components/RightPanel';
import { Canvas } from './components/Canvas';
import { CreateWorkflowModal } from './components/CreateWorkflowModal';
import { MessageModal } from './components/MessageModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ConfigPage } from './components/pages/ConfigPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { StatsPage } from './components/pages/StatsPage';
import {
  ToastContainer,
  type ToastData,
  type ToastType,
} from './components/Toast';
import { useAutoSave } from './hooks/useAutoSave';
import { useHistory } from './hooks/useHistory';
import { useOnboarding } from './hooks/useOnboarding';
import {
  createWorkflow,
  deleteWorkflow,
  fetchWorkflow,
  fetchWorkflows,
} from './api/workflows';
import type {
  AppTab,
  ChannelType,
  NodeConfig,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
  WorkflowSummary,
} from './types/workflow';
import { isChannelType, CHANNEL_CONFIG } from './config/channels';
import {
  COLUMN_STRIDE,
  ROW_STRIDE,
  calculateNodePosition,
} from './utils/gridLayout';

const LEFT_DRAWER_WIDTH = 280;
const RIGHT_PANEL_WIDTH = 320;

interface ChannelNodeData {
  channelType: ChannelType;
  label: string;
  sublabel: string;
  isConfigured: boolean;
  config: NodeConfig;
  gridCol: number;
  gridRow: number;
}

interface StartNodeData {
  label: string;
  sublabel: string;
  gridCol: number;
  gridRow: number;
}

function parseExamTypes(raw: string[] | string | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseConfig(raw: NodeConfig | string): NodeConfig {
  if (typeof raw !== 'string') return raw ?? {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function workflowToFlow(
  workflow: Workflow,
  edgeDelayHandler: (edgeId: string, days: number) => void,
): { nodes: Node[]; edges: Edge[] } {
  const wfNodes = workflow.nodes ?? [];
  const wfEdges = workflow.edges ?? [];

  const nodeChannelType = new Map<string, string>();

  const nodes: Node[] = wfNodes.map((n: WorkflowNode) => {
    const position = {
      x: n.gridCol * COLUMN_STRIDE,
      y: n.gridRow * ROW_STRIDE,
    };
    const config = safeParseConfig(n.config);

    if (n.type === 'start') {
      return {
        id: n.id,
        type: 'start',
        position,
        data: {
          label: n.label,
          sublabel: 'Point de départ',
          gridCol: n.gridCol,
          gridRow: n.gridRow,
        } satisfies StartNodeData,
      };
    }
    if (n.type === 'end') {
      return {
        id: n.id,
        type: 'end',
        position,
        data: {
          label: n.label,
          gridCol: n.gridCol,
          gridRow: n.gridRow,
        },
      };
    }
    if (isChannelType(n.type)) {
      nodeChannelType.set(n.id, n.type);
      const isConfigured = Object.keys(config).length > 0;
      return {
        id: n.id,
        type: 'channel',
        position,
        data: {
          channelType: n.type,
          label: n.label,
          sublabel:
            n.gridRow === 0 ? 'Première communication' : 'Relance',
          isConfigured,
          config,
          gridCol: n.gridCol,
          gridRow: n.gridRow,
        } satisfies ChannelNodeData,
      };
    }
    return {
      id: n.id,
      type: 'channel',
      position,
      data: {
        channelType: 'email',
        label: n.label,
        sublabel: '',
        isConfigured: false,
        config,
        gridCol: n.gridCol,
        gridRow: n.gridRow,
      } satisfies ChannelNodeData,
    };
  });

  const edges: Edge[] = wfEdges.map((e: WorkflowEdge) => {
    const sourceHandle = e.type === 'reminder' ? 'bottom' : undefined;
    const targetHandle = e.type === 'reminder' ? 'top' : undefined;
    return {
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      type: e.type,
      sourceHandle,
      targetHandle,
      data: {
        delayDays: e.delayDays ?? undefined,
        channelType: nodeChannelType.get(e.sourceId),
        onChangeDelay: edgeDelayHandler,
      },
      markerEnd: { type: 'arrowclosed', width: 12, height: 12 },
    };
  });

  return { nodes, edges };
}

function getGridFromNode(node: Node): {
  gridCol: number;
  gridRow: number;
  channelType?: ChannelType;
} {
  const d = node.data as
    | { gridCol?: number; gridRow?: number; channelType?: string }
    | undefined;
  const ct = d?.channelType;
  return {
    gridCol: d?.gridCol ?? Math.round(node.position.x / COLUMN_STRIDE),
    gridRow: d?.gridRow ?? Math.round(node.position.y / ROW_STRIDE),
    channelType: ct && isChannelType(ct) ? ct : undefined,
  };
}

export default function App() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(
    null,
  );
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const { pushState, undo: historyUndo, canUndo, reset: resetHistory } = useHistory();

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messageModalNodeId, setMessageModalNodeId] = useState<
    string | null
  >(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('editor');

  const { showOnboarding, dismissOnboarding } = useOnboarding();

  const showToast = useCallback(
    (message: string, type: ToastType = 'error') => {
      setToasts((t) => [
        ...t,
        { id: crypto.randomUUID(), message, type },
      ]);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const handleChangeDelay = useCallback(
    (edgeId: string, days: number) => {
      pushState(nodesRef.current, edgesRef.current);
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                data: { ...(e.data ?? {}), delayDays: days },
              }
            : e,
        ),
      );
    },
    [pushState],
  );

  const loadWorkflow = useCallback(
    async (id: string) => {
      const wf = await fetchWorkflow(id);
      setActiveWorkflow(wf);
      const { nodes: fn, edges: fe } = workflowToFlow(
        wf,
        handleChangeDelay,
      );
      setNodes(fn);
      setEdges(fe);
      setSelectedNodeId(null);
      resetHistory();
    },
    [handleChangeDelay, resetHistory],
  );

  useEffect(() => {
    let cancelled = false;
    fetchWorkflows()
      .then((list) => {
        if (cancelled) return;
        setWorkflows(list);
        if (list.length > 0) void loadWorkflow(list[0].id);
      })
      .catch((err) => {
        console.error('Failed to load workflows', err);
        showToast('Impossible de charger les workflows');
      })
      .finally(() => {
        if (!cancelled) setWorkflowsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadWorkflow, showToast]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      if (node.type === 'channel') setSelectedNodeId(node.id);
      else setSelectedNodeId(null);
    },
    [],
  );
  const handlePaneClick = useCallback(() => setSelectedNodeId(null), []);

  const handleAddChannelNode = useCallback(
    (channelType: ChannelType, _dropPosition: { x: number; y: number }) => {
      void _dropPosition;
      pushState(nodesRef.current, edgesRef.current);

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const sameChannelNodes = currentNodes.filter((n) => {
        if (n.type !== 'channel') return false;
        const ct = (n.data as { channelType?: string }).channelType;
        return ct === channelType;
      });

      const newId = crypto.randomUUID();
      const cfg = CHANNEL_CONFIG[channelType];

      if (sameChannelNodes.length > 0) {
        // === RELANCE (verticale) — pas d'impact sur End ===
        const last = sameChannelNodes.reduce((acc, n) => {
          const r = (n.data as { gridRow: number }).gridRow;
          const ar = (acc.data as { gridRow: number }).gridRow;
          return r > ar ? n : acc;
        });
        const lastGrid = getGridFromNode(last);
        const gridCol = lastGrid.gridCol;
        const gridRow = lastGrid.gridRow + 1;
        const pos = calculateNodePosition(gridCol, gridRow);

        const newNode: Node = {
          id: newId,
          type: 'channel',
          position: { x: pos.positionX, y: pos.positionY },
          data: {
            channelType,
            label: cfg.label,
            sublabel: 'Relance',
            isConfigured: false,
            config: {},
            gridCol,
            gridRow,
          } satisfies ChannelNodeData,
        };

        setNodes([...currentNodes, newNode]);
        setEdges([
          ...currentEdges,
          {
            id: crypto.randomUUID(),
            source: last.id,
            target: newId,
            type: 'reminder',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            data: {
              delayDays: 7,
              channelType,
              onChangeDelay: handleChangeDelay,
            },
            markerEnd: { type: 'arrowclosed', width: 12, height: 12 },
          } as Edge,
        ]);
        setSelectedNodeId(null);
        return;
      }

      // === ESCALADE (horizontale) — insertion avant End si présent ===
      const endNode = currentNodes.find((n) => n.type === 'end');
      const channelOrStartCols = currentNodes
        .filter((n) => n.type === 'channel' || n.type === 'start')
        .map((n) => getGridFromNode(n).gridCol);
      const maxCol =
        channelOrStartCols.length > 0
          ? Math.max(...channelOrStartCols)
          : 0;

      const sourceNode = currentNodes.find((n) => {
        const g = getGridFromNode(n);
        return (
          (n.type === 'channel' || n.type === 'start') &&
          g.gridCol === maxCol &&
          g.gridRow === 0
        );
      });
      const sourceNodeId = sourceNode?.id ?? null;

      let newCol: number;
      let nextNodes = currentNodes;
      let nextEdges = currentEdges;

      if (endNode) {
        const endCol = getGridFromNode(endNode).gridCol;
        newCol = endCol;
        // Pousser End d'une colonne vers la droite.
        nextNodes = currentNodes.map((n) =>
          n.id === endNode.id
            ? {
                ...n,
                position: {
                  x: (endCol + 1) * COLUMN_STRIDE,
                  y: n.position.y,
                },
                data: { ...n.data, gridCol: endCol + 1 },
              }
            : n,
        );
        // Supprimer toute edge qui pointait sur End depuis le futur source —
        // elle est remplacée par source → newChannel → End.
        nextEdges = currentEdges.filter(
          (e) =>
            !(e.target === endNode.id && e.source === sourceNodeId),
        );
      } else {
        newCol = maxCol + 1;
      }

      const pos = calculateNodePosition(newCol, 0);
      const newNode: Node = {
        id: newId,
        type: 'channel',
        position: { x: pos.positionX, y: pos.positionY },
        data: {
          channelType,
          label: cfg.label,
          sublabel: 'Première communication',
          isConfigured: false,
          config: {},
          gridCol: newCol,
          gridRow: 0,
        } satisfies ChannelNodeData,
      };

      const addedEdges: Edge[] = [];
      if (sourceNodeId) {
        addedEdges.push({
          id: crypto.randomUUID(),
          source: sourceNodeId,
          target: newId,
          type: 'escalation',
          data: {
            delayDays: undefined,
            channelType,
            onChangeDelay: handleChangeDelay,
          },
          markerEnd: { type: 'arrowclosed', width: 12, height: 12 },
        } as Edge);
      }
      if (endNode) {
        addedEdges.push({
          id: crypto.randomUUID(),
          source: newId,
          target: endNode.id,
          type: 'escalation',
          data: {
            delayDays: undefined,
            channelType,
            onChangeDelay: handleChangeDelay,
          },
          markerEnd: { type: 'arrowclosed', width: 12, height: 12 },
        } as Edge);
      }

      setNodes([...nextNodes, newNode]);
      setEdges([...nextEdges, ...addedEdges]);
      setSelectedNodeId(null);
    },
    [handleChangeDelay, pushState],
  );

  const handleAddReminder = useCallback(
    (nodeId: string) => {
      pushState(nodesRef.current, edgesRef.current);
      setNodes((currentNodes) => {
        const source = currentNodes.find((n) => n.id === nodeId);
        if (!source) return currentNodes;
        const srcData = source.data as unknown as ChannelNodeData;
        if (!isChannelType(srcData.channelType)) return currentNodes;
        const channelType = srcData.channelType;
        const cfg = CHANNEL_CONFIG[channelType];

        const sameChannelCount = currentNodes.filter((n) => {
          const ct = (n.data as { channelType?: string }).channelType;
          return ct === channelType;
        }).length;
        // sameChannelCount includes the initial node + existing reminders
        // maxReminders is the number of *reminders* allowed beyond the first node
        if (sameChannelCount - 1 >= cfg.maxReminders) {
          return currentNodes;
        }

        const sameColumnNodes = currentNodes.filter((n) => {
          const g = getGridFromNode(n);
          return g.gridCol === srcData.gridCol;
        });
        const maxRowInColumn = Math.max(
          ...sameColumnNodes.map(
            (n) => (n.data as { gridRow: number }).gridRow,
          ),
        );
        const newRow = maxRowInColumn + 1;
        const lastInColumn = sameColumnNodes.reduce((acc, n) => {
          const r = (n.data as { gridRow: number }).gridRow;
          const ar = (acc.data as { gridRow: number }).gridRow;
          return r > ar ? n : acc;
        });

        const pos = calculateNodePosition(srcData.gridCol, newRow);
        const newId = crypto.randomUUID();
        const newNode: Node = {
          id: newId,
          type: 'channel',
          position: { x: pos.positionX, y: pos.positionY },
          data: {
            channelType,
            label: cfg.label,
            sublabel: 'Relance',
            isConfigured: false,
            config: {},
            gridCol: srcData.gridCol,
            gridRow: newRow,
          } satisfies ChannelNodeData,
        };

        setEdges((currentEdges) => [
          ...currentEdges,
          {
            id: crypto.randomUUID(),
            source: lastInColumn.id,
            target: newId,
            type: 'reminder',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            data: {
              delayDays: 7,
              channelType,
              onChangeDelay: handleChangeDelay,
            },
            markerEnd: { type: 'arrowclosed', width: 12, height: 12 },
          } as Edge,
        ]);

        return [...currentNodes, newNode];
      });
    },
    [handleChangeDelay, pushState],
  );

  const handleChangeNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, label } }
            : n,
        ),
      );
    },
    [],
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    const target = nodesRef.current.find((n) => n.id === nodeId);
    if (!target || target.type === 'start' || target.type === 'end') {
      return;
    }
    pushState(nodesRef.current, edgesRef.current);
    setEdges((eds) => {
      const incoming = eds.filter((e) => e.target === nodeId);
      const outgoing = eds.filter((e) => e.source === nodeId);
      const rest = eds.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );

      const reconnections: Edge[] = [];
      const usedOutgoing = new Set<string>();
      for (const inc of incoming) {
        const matchingOut = outgoing.find(
          (out) => out.type === inc.type && !usedOutgoing.has(out.id),
        );
        if (matchingOut) {
          usedOutgoing.add(matchingOut.id);
          reconnections.push({
            ...inc,
            id: crypto.randomUUID(),
            target: matchingOut.target,
            targetHandle: matchingOut.targetHandle,
          });
        }
      }
      return [...rest, ...reconnections];
    });
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setSelectedNodeId((curr) => (curr === nodeId ? null : curr));
  }, [pushState]);

  const handleSaveMessageConfig = useCallback(
    (nodeId: string, config: NodeConfig) => {
      pushState(nodesRef.current, edgesRef.current);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  config,
                  isConfigured: Object.keys(config).length > 0,
                },
              }
            : n,
        ),
      );
      setMessageModalNodeId(null);
    },
    [pushState],
  );

  const handleWorkflowNameChange = useCallback((next: string) => {
    setActiveWorkflow((w) => {
      if (!w) return w;
      setWorkflows((list) =>
        list.map((s) =>
          s.id === w.id ? { ...s, name: next, updatedAt: new Date().toISOString() } : s,
        ),
      );
      return { ...w, name: next };
    });
  }, []);
  const handleExamTypesChange = useCallback((next: string[]) => {
    setActiveWorkflow((w) => {
      if (!w) return w;
      setWorkflows((list) =>
        list.map((s) =>
          s.id === w.id ? { ...s, examTypes: next, updatedAt: new Date().toISOString() } : s,
        ),
      );
      return { ...w, examTypes: next };
    });
  }, []);
  const handleGlobalTimeoutChange = useCallback((days: number) => {
    setActiveWorkflow((w) => {
      if (!w) return w;
      setWorkflows((list) =>
        list.map((s) =>
          s.id === w.id ? { ...s, globalTimeout: days, updatedAt: new Date().toISOString() } : s,
        ),
      );
      return { ...w, globalTimeout: days };
    });
  }, []);

  const handleCreateWorkflow = useCallback(
    async (name: string, examTypes: string[]) => {
      // Errors are re-thrown so the modal can show them inline.
      const created = await createWorkflow({ name, examTypes });
      const summary: WorkflowSummary = {
        id: created.id,
        name: created.name,
        examTypes: created.examTypes,
        globalTimeout: created.globalTimeout,
        createdAt: created.createdAt ?? new Date().toISOString(),
        updatedAt: created.updatedAt ?? new Date().toISOString(),
        _count: {
          nodes: created.nodes?.length ?? 1,
          edges: created.edges?.length ?? 0,
        },
      };
      setWorkflows((list) => [summary, ...list]);
      setShowCreateModal(false);
      await loadWorkflow(created.id);
    },
    [loadWorkflow],
  );

  const handleDeleteWorkflow = useCallback(
    async (id: string) => {
      try {
        await deleteWorkflow(id);
      } catch (err) {
        console.error('Delete failed', err);
        showToast('Échec de la suppression du workflow');
        return;
      }
      setWorkflows((list) => {
        const next = list.filter((w) => w.id !== id);
        if (activeWorkflow?.id === id) {
          if (next.length > 0) void loadWorkflow(next[0].id);
          else {
            setActiveWorkflow(null);
            setNodes([]);
            setEdges([]);
          }
        }
        return next;
      });
    },
    [activeWorkflow?.id, loadWorkflow, showToast],
  );

  const activeExamTypes = useMemo(
    () => parseExamTypes(activeWorkflow?.examTypes),
    [activeWorkflow?.examTypes],
  );

  const autoSaveOptions = useMemo(
    () => ({
      name: activeWorkflow?.name,
      examTypes: activeExamTypes,
      globalTimeout: activeWorkflow?.globalTimeout,
    }),
    [
      activeWorkflow?.name,
      activeExamTypes,
      activeWorkflow?.globalTimeout,
    ],
  );

  const handleSaved = useCallback(
    (wfId: string) => {
      setWorkflows((list) =>
        list.map((s) =>
          s.id === wfId
            ? { ...s, updatedAt: new Date().toISOString() }
            : s,
        ),
      );
    },
    [],
  );

  const { saveNow } = useAutoSave(
    activeWorkflow?.id ?? null,
    nodes,
    edges,
    autoSaveOptions,
    setSaveStatus,
    handleSaved,
  );

  const handleUndo = useCallback(() => {
    const entry = historyUndo();
    if (!entry) return;
    setNodes(entry.nodes);
    // Re-inject onChangeDelay callback stripped by JSON serialization in useHistory
    setEdges(
      entry.edges.map((e) =>
        e.data
          ? { ...e, data: { ...e.data, onChangeDelay: handleChangeDelay } }
          : e,
      ),
    );
  }, [historyUndo, handleChangeDelay]);

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return true;
      }
      return target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      const cmd = e.metaKey || e.ctrlKey;

      if (cmd && e.key === 's') {
        e.preventDefault();
        void saveNow();
        return;
      }

      if (cmd && e.key === 'z' && !e.shiftKey) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        handleUndo();
        return;
      }

      if (cmd && e.key === 'n') {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        setShowCreateModal(true);
        return;
      }

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedNodeId
      ) {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        handleDeleteNode(selectedNodeId);
        return;
      }

      if (e.key === 'Escape') {
        if (messageModalNodeId || showCreateModal) return;
        if (isEditableTarget(e.target)) return;
        setSelectedNodeId(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    saveNow,
    handleUndo,
    selectedNodeId,
    handleDeleteNode,
    messageModalNodeId,
    showCreateModal,
  ]);

  const selectedNodeInfo: SelectedNodeInfo | null = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((x) => x.id === selectedNodeId);
    if (!n || n.type !== 'channel') return null;
    const d = n.data as unknown as ChannelNodeData;
    if (!isChannelType(d.channelType)) return null;
    const cfg = CHANNEL_CONFIG[d.channelType];

    const sameChannelCount = nodes.filter((x) => {
      const dx = (x.data as { channelType?: string }).channelType;
      return dx === d.channelType;
    }).length;
    const remainingReminders = Math.max(
      cfg.maxReminders - (sameChannelCount - 1),
      0,
    );

    return {
      id: n.id,
      channelType: d.channelType,
      label: d.label,
      sublabel: d.sublabel,
      config: d.config ?? {},
      canAddReminder: remainingReminders > 0,
      remainingReminders,
    };
  }, [selectedNodeId, nodes]);

  const messageModalNodeInfo = useMemo(() => {
    if (!messageModalNodeId) return null;
    const n = nodes.find((x) => x.id === messageModalNodeId);
    if (!n) return null;
    const d = n.data as unknown as ChannelNodeData;
    if (!isChannelType(d.channelType)) return null;
    return { id: n.id, channelType: d.channelType, config: d.config ?? {} };
  }, [messageModalNodeId, nodes]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FAFAFA] text-gray-900 overflow-hidden">
      <TopBar
        workflowName={activeWorkflow?.name ?? ''}
        onWorkflowNameChange={handleWorkflowNameChange}
        examTypes={activeExamTypes}
        onExamTypesChange={handleExamTypesChange}
        saveStatus={saveStatus}
        leftDrawerOpen={leftDrawerOpen}
        onToggleLeftDrawer={() => setLeftDrawerOpen((o) => !o)}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen((o) => !o)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="flex-1 flex min-h-0">
        {activeTab === 'editor' && (
          <div
            className="shrink-0 overflow-hidden transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: leftDrawerOpen ? LEFT_DRAWER_WIDTH : 0 }}
          >
            <div style={{ width: LEFT_DRAWER_WIDTH, height: '100%' }}>
              <LeftDrawer
                workflows={workflows}
                activeWorkflowId={activeWorkflow?.id ?? null}
                onSelect={(id) => void loadWorkflow(id)}
                onCreate={() => setShowCreateModal(true)}
                onDelete={handleDeleteWorkflow}
                loading={workflowsLoading}
              />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 relative">
          {/* Editor — toujours monté pour préserver l'état ReactFlow (ARCHI-1) */}
          <div
            style={{ display: activeTab === 'editor' ? 'block' : 'none' }}
            className="w-full h-full"
          >
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onAddChannelNode={handleAddChannelNode}
              onUndo={handleUndo}
              canUndo={canUndo}
            />
          </div>

          <div
            style={{ display: activeTab === 'stats' ? 'block' : 'none' }}
            className="w-full h-full overflow-auto"
          >
            <StatsPage />
          </div>

          <div
            style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}
            className="w-full h-full overflow-auto"
          >
            <DashboardPage />
          </div>

          <div
            style={{ display: activeTab === 'config' ? 'block' : 'none' }}
            className="w-full h-full overflow-auto"
          >
            <ConfigPage />
          </div>
        </main>

        {activeTab === 'editor' && (
          <div
            className="shrink-0 overflow-hidden transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0 }}
          >
            <div style={{ width: RIGHT_PANEL_WIDTH, height: '100%' }}>
              <RightPanel
                globalTimeout={activeWorkflow?.globalTimeout ?? 7}
                onChangeGlobalTimeout={handleGlobalTimeoutChange}
                selectedNode={selectedNodeInfo}
                onChangeNodeLabel={handleChangeNodeLabel}
                onAddReminder={handleAddReminder}
                onDeleteNode={handleDeleteNode}
                onOpenMessageModal={(nodeId) =>
                  setMessageModalNodeId(nodeId)
                }
              />
            </div>
          </div>
        )}
      </div>

      <CreateWorkflowModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateWorkflow}
      />

      {messageModalNodeInfo && (
        <MessageModal
          open
          channelType={messageModalNodeInfo.channelType}
          config={messageModalNodeInfo.config}
          onClose={() => setMessageModalNodeId(null)}
          onSave={(cfg) =>
            handleSaveMessageConfig(messageModalNodeInfo.id, cfg)
          }
        />
      )}

      <OnboardingModal
        open={showOnboarding && !workflowsLoading}
        onDismiss={dismissOnboarding}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
