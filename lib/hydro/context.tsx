"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type {
  CleanStats,
  DetrendedRecord,
  HydroRecord,
  ScannedFile,
  WizardState,
  WizardStep,
} from "./types";

const initialState: WizardState = {
  currentStep: 1,
  stationId: "",
  uploadedFiles: [],
  scannedFiles: [],
  dateRange: null,
  selectedRange: null,
  isLocked: false,
  cleanedData: [],
  cleanStats: null,
  detrendStrategy: "skip",
  eventThreshold: 0.5,
  processingProgress: 0,
  detrendedData: [],
};

export type WizardAction =
  | { type: "SET_STEP"; payload: WizardStep }
  | { type: "SET_STATION_ID"; payload: string }
  | { type: "SET_UPLOADED_FILES"; payload: File[] }
  | { type: "SET_SCANNED_FILES"; payload: ScannedFile[] }
  | { type: "SET_DATE_RANGE"; payload: { start: Date; end: Date } | null }
  | { type: "SET_SELECTED_RANGE"; payload: { start: Date; end: Date } | null }
  | { type: "LOCK_SETTINGS" }
  | { type: "SET_CLEANED_DATA"; payload: HydroRecord[] }
  | { type: "SET_CLEAN_STATS"; payload: CleanStats }
  | { type: "SET_DETREND_STRATEGY"; payload: WizardState["detrendStrategy"] }
  | { type: "SET_DETRENDED_DATA"; payload: DetrendedRecord[] }
  | { type: "SET_EVENT_THRESHOLD"; payload: number }
  | { type: "SET_PROCESSING_PROGRESS"; payload: number }
  | { type: "RESET" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_STATION_ID":
      if (state.isLocked) return state;
      return { ...state, stationId: action.payload };
    case "SET_UPLOADED_FILES":
      return { ...state, uploadedFiles: action.payload };
    case "SET_SCANNED_FILES":
      return { ...state, scannedFiles: action.payload };
    case "SET_DATE_RANGE":
      if (state.isLocked) return state;
      return { ...state, dateRange: action.payload };
    case "SET_SELECTED_RANGE":
      if (state.isLocked) return state;
      return { ...state, selectedRange: action.payload };
    case "LOCK_SETTINGS":
      return { ...state, isLocked: true };
    case "SET_CLEANED_DATA":
      return { ...state, cleanedData: action.payload };
    case "SET_CLEAN_STATS":
      return { ...state, cleanStats: action.payload };
    case "SET_DETREND_STRATEGY":
      return { ...state, detrendStrategy: action.payload };
    case "SET_DETRENDED_DATA":
      return { ...state, detrendedData: action.payload };
    case "SET_EVENT_THRESHOLD":
      return { ...state, eventThreshold: action.payload };
    case "SET_PROCESSING_PROGRESS":
      return { ...state, processingProgress: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type WizardStore = WizardState & {
  dispatch: (action: WizardAction) => void;
};

function createWizardStore() {
  return createStore<WizardStore>()((set, get) => ({
    ...initialState,
    dispatch: (action) => {
      const currentState = get();
      const nextState = wizardReducer(currentState, action);
      set(nextState);
    },
  }));
}

const WizardStoreContext = createContext<ReturnType<typeof createWizardStore> | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createWizardStore);

  return (
    <WizardStoreContext.Provider value={store}>
      {children}
    </WizardStoreContext.Provider>
  );
}

function useWizardStoreContext() {
  const context = useContext(WizardStoreContext);
  if (!context) {
    throw new Error("Wizard hooks must be used within a WizardProvider");
  }
  return context;
}

export function useWizardStore<T>(selector: (state: WizardState) => T): T {
  const store = useWizardStoreContext();
  return useStore(store, selector as (state: WizardStore) => T);
}

export function useWizardDispatch() {
  return useWizardStoreContext().getState().dispatch;
}
