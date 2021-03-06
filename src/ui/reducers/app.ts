import { AppState } from "ui/state/app";
import { AppActions } from "ui/actions/app";
import { UIState } from "ui/state";
import { SessionActions } from "ui/actions/session";
const { prefs } = require("../utils/prefs");
import { Location } from "@recordreplay/protocol";
import { getLocationKey } from "devtools/client/debugger/src/utils/breakpoint";

function initialAppState(): AppState {
  return {
    recordingId: null,
    expectedError: null,
    unexpectedError: null,
    theme: "theme-light",
    splitConsoleOpen: prefs.splitConsole,
    selectedPanel: prefs.selectedPanel,
    selectedPrimaryPanel: "explorer",
    initializedPanels: [],
    loading: 4,
    uploading: null,
    sessionId: null,
    modal: null,
    pendingNotification: null,
    analysisPoints: {},
    events: {},
    viewMode: prefs.viewMode,
    narrowMode: false,
    hoveredLineNumberLocation: null,
    isNodePickerActive: false,
    canvas: null,
  };
}

export default function update(
  state = initialAppState(),
  action: AppActions | SessionActions
): AppState {
  switch (action.type) {
    case "setup_app": {
      return { ...state, recordingId: action.recordingId };
    }

    case "set_uploading": {
      return { ...state, uploading: action.uploading };
    }

    case "set_expected_error": {
      return { ...state, expectedError: action.error };
    }

    case "set_unexpected_error": {
      return { ...state, unexpectedError: action.error };
    }

    case "update_theme": {
      return { ...state, theme: action.theme };
    }

    case "set_selected_panel": {
      return { ...state, selectedPanel: action.panel };
    }

    case "set_selected_primary_panel": {
      return { ...state, selectedPrimaryPanel: action.panel };
    }

    case "set_initialized_panels": {
      return { ...state, initializedPanels: [...state.initializedPanels, action.panel] };
    }

    case "set_split_console": {
      return { ...state, splitConsoleOpen: action.splitConsole };
    }

    case "loading": {
      return { ...state, loading: action.loading };
    }

    case "set_session_id": {
      return { ...state, sessionId: action.sessionId };
    }

    case "set_modal": {
      return { ...state, modal: action.modal };
    }

    case "set_analysis_points": {
      const id = getLocationKey(action.location);

      return {
        ...state,
        analysisPoints: {
          ...state.analysisPoints,
          [id]: action.analysisPoints,
        },
      };
    }

    case "set_events": {
      return {
        ...state,
        events: {
          ...state.events,
          [action.eventType]: action.events,
        },
      };
    }

    case "set_pending_notification": {
      return { ...state, pendingNotification: action.location };
    }

    case "set_view_mode": {
      return { ...state, viewMode: action.viewMode };
    }

    case "set_narrow_mode": {
      return {
        ...state,
        narrowMode: action.narrowMode,
      };
    }

    case "set_hovered_line_number_location": {
      return {
        ...state,
        hoveredLineNumberLocation: action.location,
      };
    }

    case "set_is_node_picker_active": {
      return {
        ...state,
        isNodePickerActive: action.active,
      };
    }

    case "set_canvas": {
      return {
        ...state,
        canvas: action.canvas,
      };
    }

    default: {
      return state;
    }
  }
}

export const getTheme = (state: UIState) => state.app.theme;
export const isSplitConsoleOpen = (state: UIState) => state.app.splitConsoleOpen;
export const getSelectedPanel = (state: UIState) => state.app.selectedPanel;
export const getSelectedPrimaryPanel = (state: UIState) => state.app.selectedPrimaryPanel;
export const getInitializedPanels = (state: UIState) => state.app.initializedPanels;
export const getLoading = (state: UIState) => state.app.loading;
export const getUploading = (state: UIState) => state.app.uploading;
export const getRecordingId = (state: UIState) => state.app.recordingId;
export const getSessionId = (state: UIState) => state.app.sessionId;
export const getExpectedError = (state: UIState) => state.app.expectedError;
export const getUnexpectedError = (state: UIState) => state.app.unexpectedError;
export const getModal = (state: UIState) => state.app.modal;
export const getAnalysisPoints = (state: UIState) => state.app.analysisPoints;
export const getPendingNotification = (state: UIState) => state.app.pendingNotification;
export const getAnalysisPointsForLocation = (state: UIState, location: Location | null) =>
  location && state.app.analysisPoints[getLocationKey(location)];
export const getViewMode = (state: UIState) => state.app.viewMode;
export const getNarrowMode = (state: UIState) => state.app.narrowMode;
export const getHoveredLineNumberLocation = (state: UIState) => state.app.hoveredLineNumberLocation;
export const getPointsForHoveredLineNumber = (state: UIState) => {
  const location = getHoveredLineNumberLocation(state);
  return getAnalysisPointsForLocation(state, location);
};
export const getEventsForType = (state: UIState, type: string) => state.app.events[type] || [];
export const getIsNodePickerActive = (state: UIState) => state.app.isNodePickerActive;
export const getCanvas = (state: UIState) => state.app.canvas;
