import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { prefs } from "../utils/prefs";
import { selectors } from "../reducers";

import "./SkeletonLoader.css";

function SkeletonLoader({ setFinishedLoading, progress = 1, content, viewMode }) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const key = useRef(null);
  const backgroundColor = `hsl(0, 0%, ${35 - displayedProgress * 0.35}%)`;

  useEffect(() => {
    return () => clearTimeout(key.current);
  }, []);

  useEffect(() => {
    if (displayedProgress == 100) {
      // This gives the Loader component some time (300ms) to bring the progress
      // bar to 100% before unmounting this loader and showing the application.
      setTimeout(() => setFinishedLoading(true), 300);
    }

    // This handles the artificial progress bump. It has a randomized increment
    // whose effect is decayed as the progress approaches 100/100. Whenever the
    // underlying progress is higher than the artificial progress, we update to use
    // the underlying progress. Expected behavior assuming no underlying progress is:
    // 10s (50%) 20s (70%) 30s (85%) 45s (95%) 60s (98%)
    key.current = setTimeout(() => {
      const increment = Math.random();
      const decayed = increment * ((100 - displayedProgress) / 40);
      const newDisplayedProgress = Math.max(displayedProgress + decayed, progress);

      setDisplayedProgress(newDisplayedProgress);
    }, 200);
  }, [displayedProgress]);

  return (
    <div className="loader">
      <Header content={content} progress={progress} />
      {viewMode == "non-dev" ? (
        <NonDevMain backgroundColor={backgroundColor} displayedProgress={displayedProgress} />
      ) : (
        <DevMain displayedProgress={displayedProgress} />
      )}
    </div>
  );
}

function Header({ progress, content }) {
  return (
    <header id="header">
      <div className="header-left">
        <div className="loading-placeholder back" />
      </div>
      <div className="message">{progress == 100 ? "Ready" : content}</div>
      <div className="links">
        <div className="loading-placeholder view" />
        <div className="loading-placeholder avatar" />
      </div>
    </header>
  );
}

function NonDevMain({ backgroundColor, displayedProgress }) {
  return (
    <main>
      <div className="comments" style={{ width: prefs.nonDevSidePanelWidth }}>
        <div className="loading-placeholder" />
        <div className="loading-placeholder" />
        <div className="loading-placeholder" />
      </div>
      <section>
        <div className="video" style={{ background: backgroundColor }}></div>
        <div className="timeline">
          <div className="loading-container">
            <div className="progress-line full" />
            <div className="progress-line" style={{ width: `${displayedProgress}%` }} />
          </div>
        </div>
      </section>
    </main>
  );
}

function DevMain({ displayedProgress }) {
  return (
    <main>
      <section style={{ width: "100%" }}>
        <div className="debugger" />
        <div className="timeline">
          <div className="loading-container">
            <div className="progress-line full" />
            <div className="progress-line" style={{ width: `${displayedProgress}%` }} />
            <div className="tooltip" style={{ left: `${displayedProgress}%` }}>
              Loading...
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default connect(state => ({
  viewMode: selectors.getViewMode(state),
}))(SkeletonLoader);
