.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--nav-bg);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(120, 90, 160, 0.12);
  padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
  z-index: 20;
}

@media (min-width: 860px) {
  .nav-bar {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    bottom: 24px;
    justify-content: center;
    gap: 28px;
    border: 1px solid rgba(120, 90, 160, 0.14);
    border-radius: 999px;
    padding: 10px 20px;
    box-shadow: var(--shadow);
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--ink-soft);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 14px;
  min-width: 64px;
}

.nav-item-active {
  color: var(--accent);
  background: rgba(138, 95, 199, 0.12);
}

.nav-emoji {
  font-size: 1.3rem;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.app-brand {
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.ready {
  background: #57b894;
}
.status-dot.loading {
  background: #e0b04d;
}
.status-dot.error,
.status-dot.disconnected,
.status-dot.no-client-id {
  background: #d97a7a;
}

/* Capture */
.capture-card {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.capture-textarea {
  width: 100%;
  min-height: 160px;
  resize: vertical;
  border: 1px solid rgba(120, 90, 160, 0.18);
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: 1.05rem;
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
}

.capture-textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.capture-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.recent-list {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Thought card */
.thought-card {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thought-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.thought-date {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.thought-text {
  white-space: pre-wrap;
  line-height: 1.55;
}

.thought-actions {
  display: flex;
  gap: 8px;
}

.pending-badge {
  font-size: 0.7rem;
  color: #a1791f;
  background: #fff3cd;
  padding: 2px 8px;
  border-radius: 999px;
}

/* Theme view header */
.theme-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.theme-header .emoji {
  font-size: 2rem;
}

.theme-header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-soft);
}

/* Mind map */
.mindmap-wrap {
  display: flex;
  justify-content: center;
}

.mindmap-svg {
  width: 100%;
  height: auto;
  max-width: 640px;
}

.mindmap-node {
  cursor: pointer;
  pointer-events: bounding-box;
}

.mindmap-node circle {
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 3;
  transition: r 0.15s ease;
}

.mindmap-node:hover circle {
  filter: brightness(1.05);
}

.mindmap-label {
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
  fill: var(--ink);
  pointer-events: none;
}

.mindmap-count {
  font-size: 10.5px;
  text-anchor: middle;
  fill: var(--ink-soft);
  pointer-events: none;
}

.mindmap-center circle {
  fill: #ffffff;
}

.mindmap-center text {
  font-size: 15px;
  font-weight: 800;
}

.mindmap-link {
  stroke-width: 2.5;
  opacity: 0.55;
}

/* Settings */
.settings-section {
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings-section h3 {
  margin: 0;
  font-size: 1rem;
}

.settings-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(120, 90, 160, 0.25);
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.75);
  color: var(--ink);
}

.setup-steps {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.setup-steps code {
  background: rgba(120, 90, 160, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.85em;
}

.toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #3a2e4d;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.85rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 30;
}

@media (min-width: 860px) {
  .toast {
    bottom: 32px;
  }
}
