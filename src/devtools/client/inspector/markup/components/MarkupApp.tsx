import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { UIState } from "ui/state";
import { Inspector } from "../../inspector";
import MarkupSearchbox from "../searchbox";
import Nodes from "./Nodes";
const { HTMLBreadcrumbs } = require("devtools/client/inspector/breadcrumbs");
const LoadingProgressBar = require("ui/components/shared/LoadingProgressBar").default;

export interface MarkupProps {
  onSelectNode: (nodeId: string) => void;
  onShowEventTooltip: (nodeId: string, element: EventTarget) => void;
  onToggleNodeExpanded: (nodeId: string, isExpanded: boolean) => void;
  onMouseEnterNode: (nodeId: string) => void;
  onMouseLeaveNode: (nodeId: string) => void;
}

function setupLegacyComponents(inspector: Inspector) {
  const searchbox = new MarkupSearchbox(inspector);
  searchbox.setupSearchBox();
  new HTMLBreadcrumbs(inspector);
}

function MarkupApp(props: PropsFromRedux & { inspector: Inspector }) {
  const isMarkupEmpty = (props.markupRootNode?.children?.length || 0) == 0;

  useEffect(() => setupLegacyComponents(props.inspector), []);

  return (
    <div className="devtools-inspector-tab-panel">
      <div id="inspector-main-content" className="devtools-main-content">
        <div id="inspector-toolbar" className="devtools-toolbar devtools-input-toolbar">
          <div id="inspector-search" className="devtools-searchbox">
            <input
              id="inspector-searchbox"
              className="devtools-searchinput"
              type="search"
              placeholder="Search HTML"
            />
            <button
              id="inspector-searchinput-clear"
              className="devtools-searchinput-clear"
              hidden={true}
              tabIndex={-1}
            ></button>
          </div>
          <div id="inspector-searchlabel-container" hidden={true}>
            <div className="devtools-separator"></div>
            <span id="inspector-searchlabel"></span>
          </div>
          <div className="devtools-separator" hidden={true}></div>
          <button
            id="inspector-element-add-button"
            className="devtools-button"
            data-localization="title=inspectorAddNode.label"
            hidden={true}
          ></button>
          <button
            id="inspector-eyedropper-toggle"
            className="devtools-button"
            hidden={true}
          ></button>
        </div>
        <div id="markup-box" className="theme-body devtools-monospace">
          <div id="markup-root-wrapper" role="presentation">
            <div id="markup-root" role="presentation">
              {<Nodes {...props.inspector.markup.getMarkupProps()} />}
            </div>
          </div>
          {isMarkupEmpty ? <LoadingProgressBar /> : null}
        </div>
        <div id="inspector-breadcrumbs-toolbar" className="devtools-toolbar">
          <div
            id="inspector-breadcrumbs"
            className="breadcrumbs-widget-container"
            role="toolbar"
            data-localization="aria-label=inspector.breadcrumbs.label"
            tabIndex={0}
          ></div>
        </div>
      </div>
    </div>
  );
}

const connector = connect((state: UIState) => ({
  markupRootNode: state.markup.tree[state.markup.rootNode!],
}));
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(MarkupApp);
