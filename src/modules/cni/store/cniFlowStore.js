import { create } from 'zustand';

export const useCniFlowStore = create((set) => ({
  currentStage: null,
  selectedProjectId: null,
  activeGate: null,
  workflowNavigation: {},
  temporaryUIState: {},

  setCurrentStage: (stage) => set({ currentStage: stage }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setActiveGate: (gate) => set({ activeGate: gate }),
  setWorkflowNavigation: (nav) => set((state) => ({ workflowNavigation: { ...state.workflowNavigation, ...nav } })),
  setTemporaryUIState: (uiState) => set((state) => ({ temporaryUIState: { ...state.temporaryUIState, ...uiState } })),
  resetFlow: () => set({
    currentStage: null,
    selectedProjectId: null,
    activeGate: null,
    workflowNavigation: {},
    temporaryUIState: {}
  })
}));
