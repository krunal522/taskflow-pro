import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  Bell,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './FocusTimerModal.css';

const TIMER_MODES = [
  { id: 'pomodoro', label: 'Deep Work', minutes: 25 },
  { id: 'shortBreak', label: 'Short Break', minutes: 5 },
  { id: 'longBreak', label: 'Long Break', minutes: 15 },
];

const FocusTimerModal = ({ tasks = [], onClose, onTaskCompleted }) => {
  const [activeMode, setActiveMode] = useState('pomodoro');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const currentTask = tasks.find((t) => t._id === selectedTaskId);

  // Set mode time
  const handleModeChange = (mode) => {
    setActiveMode(mode.id);
    setTimeLeft(mode.minutes * 60);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            // Play notification tone
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 587.33; // D5 note
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 1.2);
            } catch {
              // Audio context not available/allowed
            }
            toast.success(
              activeMode === 'pomodoro'
                ? 'Deep work session complete! Take a breather 🧘'
                : 'Break over! Ready to focus? ⚡',
              { duration: 5000 }
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, activeMode]);

  const togglePlay = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    const modeObj = TIMER_MODES.find((m) => m.id === activeMode);
    setTimeLeft((modeObj ? modeObj.minutes : 25) * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentModeTotalSeconds = (TIMER_MODES.find((m) => m.id === activeMode)?.minutes || 25) * 60;
  const progressPct = ((currentModeTotalSeconds - timeLeft) / currentModeTotalSeconds) * 100;
  const strokeDashoffset = 282.7 - (282.7 * progressPct) / 100;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="focus-modal-box">
        {/* Header */}
        <div className="focus-header">
          <div className="focus-header-title">
            <div className="focus-icon-wrap">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="focus-title">Deep Work Focus Engine</h3>
              <p className="focus-subtitle">Time-block your deep focus tasks with Pomodoro</p>
            </div>
          </div>
          <button className="focus-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        <div className="focus-body">
          {/* Mode Switcher Tabs */}
          <div className="focus-modes-tabs">
            {TIMER_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`focus-mode-tab ${activeMode === mode.id ? 'active' : ''}`}
                onClick={() => handleModeChange(mode)}
              >
                {mode.label} ({mode.minutes}m)
              </button>
            ))}
          </div>

          {/* Target Task Selector */}
          <div className="focus-task-select-wrap">
            <Target size={14} className="focus-target-icon" />
            <select
              className="focus-task-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="">-- Attach a task to this session (Optional) --</option>
              {tasks
                .filter((t) => t.status !== 'done')
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.priority.toUpperCase()})
                  </option>
                ))}
            </select>
          </div>

          {currentTask && (
            <div className="focus-current-task-pill">
              <span className="task-pill-dot" />
              <span className="task-pill-text">Working on: &quot;{currentTask.title}&quot;</span>
              {onTaskCompleted && (
                <button
                  type="button"
                  className="task-pill-done-btn"
                  onClick={() => {
                    onTaskCompleted(currentTask._id);
                    toast.success('Task marked as Done! 🎉');
                  }}
                  title="Mark this task as Done"
                >
                  <CheckCircle2 size={13} /> Complete
                </button>
              )}
            </div>
          )}

          {/* SVG Countdown Ring */}
          <div className="focus-timer-ring-container">
            <svg className="focus-ring-svg" viewBox="0 0 100 100">
              <circle className="focus-ring-bg" cx="50" cy="50" r="45" />
              <circle
                className={`focus-ring-bar ${activeMode}`}
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: 282.7,
                  strokeDashoffset,
                }}
              />
            </svg>
            <div className="focus-timer-display">
              <span className="focus-time-text">{formattedTime}</span>
              <span className="focus-time-label">
                {isRunning ? '⚡ Session in progress' : '⏸️ Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="focus-controls">
            <button
              type="button"
              className={`focus-play-btn ${isRunning ? 'pause' : 'play'}`}
              onClick={togglePlay}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              type="button"
              className="focus-reset-btn"
              onClick={resetTimer}
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimerModal;
