import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import './ShortcutsModal.css';

const SHORTCUTS = [
  { key: 'N', description: 'Create new task' },
  { key: '/', description: 'Focus search bar' },
  { key: '1', description: 'Switch to Kanban Board view' },
  { key: '2', description: 'Switch to List / Table view' },
  { key: 'A', description: 'Open Productivity Analytics' },
  { key: '?', description: 'Open this Keyboard Shortcuts cheatsheet' },
  { key: 'Esc', description: 'Close modals / dialogs' },
];

const ShortcutsModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shortcuts-modal-box">
        <div className="shortcuts-header">
          <div className="shortcuts-title-group">
            <div className="shortcuts-icon-wrap">
              <Keyboard size={18} />
            </div>
            <div>
              <h3 className="shortcuts-title">Keyboard Shortcuts</h3>
              <p className="shortcuts-subtitle">Power up your workflow with quick hotkeys</p>
            </div>
          </div>
          <button className="shortcuts-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        <div className="shortcuts-list">
          {SHORTCUTS.map((item, idx) => (
            <div key={idx} className="shortcut-row">
              <span className="shortcut-desc">{item.description}</span>
              <kbd className="shortcut-key">{item.key}</kbd>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <span>ProTip: Press <kbd className="shortcut-key inline">?</kbd> anywhere to trigger this guide</span>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
