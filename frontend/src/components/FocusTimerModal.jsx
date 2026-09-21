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
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './FocusTimerModal.css';

const TIMER_MODES = [
  { id: 'pomodoro', label: 'Deep Work', minutes: 25 },
  { id: 'shortBreak', label: 'Short Break', minutes: 5 },
  { id: 'longBreak', label: 'Long Break', minutes: 15 },
];

const getInitialTimerState = () => {
  try {
    const savedMode = localStorage.getItem('taskflow_timer_mode') || 'pomodoro';
    const modeObj = TIMER_MODES.find((m) => m.id === savedMode) || TIMER_MODES[0];
    const savedTaskId = localStorage.getItem('taskflow_timer_selected_task') || '';
    const wasRunning = localStorage.getItem('taskflow_timer_is_running') === 'true';
    const endTimestamp = parseInt(localStorage.getItem('taskflow_timer_end_timestamp') || '0', 10);
    const savedSecondsLeft = parseInt(localStorage.getItem('taskflow_timer_seconds_left') || '0', 10);

    if (wasRunning && endTimestamp > Date.now()) {
      const remaining = Math.round((endTimestamp - Date.now()) / 1000);
      return {
        activeMode: savedMode,
        selectedTaskId: savedTaskId,
        timeLeft: remaining,
        isRunning: true,
      };
    } else if (savedSecondsLeft > 0) {
      return {
        activeMode: savedMode,
        selectedTaskId: savedTaskId,
        timeLeft: savedSecondsLeft,
        isRunning: false,
      };
    }

    return {
      activeMode: savedMode,
      selectedTaskId: savedTaskId,
      timeLeft: modeObj.minutes * 60,
      isRunning: false,
    };
  } catch {
    return {
      activeMode: 'pomodoro',
      selectedTaskId: '',
      timeLeft: 25 * 60,
      isRunning: false,
    };
  }
};

const FocusTimerModal = ({ tasks = [], onClose, onTaskCompleted }) => {
  const initial = getInitialTimerState();
  const [activeMode, setActiveMode] = useState(initial.activeMode);
  const [selectedTaskId, setSelectedTaskId] = useState(initial.selectedTaskId);
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const currentTask = safeTasks.find((t) => t._id === selectedTaskId);

  // Play audio tone on completion
  const playChime = () => {
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
    } catch {}
  };

  // Switch modes (Deep Work / Short Break / Long Break)
  const handleModeChange = (mode) => {
    setActiveMode(mode.id);
    const newSeconds = mode.minutes * 60;
    setTimeLeft(newSeconds);
    setIsRunning(false);
    clearInterval(intervalRef.current);

    try {
      localStorage.setItem('taskflow_timer_mode', mode.id);
      localStorage.setItem('taskflow_timer_seconds_left', newSeconds.toString());
      localStorage.setItem('taskflow_timer_is_running', 'false');
      localStorage.removeItem('taskflow_timer_end_timestamp');
    } catch {}
  };

  // Task selection
  const handleTaskSelect = (taskId) => {
    setSelectedTaskId(taskId);
    try {
      localStorage.setItem('taskflow_timer_selected_task', taskId);
    } catch {}
  };

  // Start / Pause
  const togglePlay = () => {
    if (!isRunning) {
      // Start
      const targetEnd = Date.now() + timeLeft * 1000;
      try {
        localStorage.setItem('taskflow_timer_end_timestamp', targetEnd.toString());
        localStorage.setItem('taskflow_timer_is_running', 'true');
        localStorage.setItem('taskflow_timer_mode', activeMode);
        localStorage.setItem('taskflow_timer_selected_task', selectedTaskId);
      } catch {}
      setIsRunning(true);
      toast.success(
        activeMode === 'pomodoro'
          ? 'Deep work timer started! Stay in the flow ⚡'
          : 'Break timer started! Relax and stretch 🧘'
      );
    } else {
      // Pause
      try {
        localStorage.setItem('taskflow_timer_seconds_left', timeLeft.toString());
        localStorage.setItem('taskflow_timer_is_running', 'false');
        localStorage.removeItem('taskflow_timer_end_timestamp');
      } catch {}
      setIsRunning(false);
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    const modeObj = TIMER_MODES.find((m) => m.id === activeMode) || TIMER_MODES[0];
    const defaultSeconds = modeObj.minutes * 60;
    setTimeLeft(defaultSeconds);

    try {
      localStorage.setItem('taskflow_timer_seconds_left', defaultSeconds.toString());
      localStorage.setItem('taskflow_timer_is_running', 'false');
      localStorage.removeItem('taskflow_timer_end_timestamp');
    } catch {}

    toast.success('Timer reset');
  };

  // Timestamp-based countdown loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        try {
          const endTimestamp = parseInt(
            localStorage.getItem('taskflow_timer_end_timestamp') || '0',
            10
          );
          if (endTimestamp > 0) {
            const diff = Math.round((endTimestamp - Date.now()) / 1000);
            if (diff <= 0) {
              clearInterval(intervalRef.current);
              setTimeLeft(0);
              setIsRunning(false);
              localStorage.setItem('taskflow_timer_is_running', 'false');
              localStorage.removeItem('taskflow_timer_end_timestamp');
              localStorage.setItem('taskflow_timer_seconds_left', '0');
              playChime();
              toast.success(
                activeMode === 'pomodoro'
                  ? 'Deep work session complete! Take a breather 🧘'
                  : 'Break over! Ready for another focus round? ⚡',
                { duration: 6000 }
              );
              return;
            }
            setTimeLeft(diff);
            localStorage.setItem('taskflow_timer_seconds_left', diff.toString());
          }
        } catch {
          setTimeLeft((prev) => Math.max(0, prev - 1));
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, activeMode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentModeTotalSeconds =
    (TIMER_MODES.find((m) => m.id === activeMode)?.minutes || 25) * 60;
  const progressPct =
    currentModeTotalSeconds > 0
      ? ((currentModeTotalSeconds - timeLeft) / currentModeTotalSeconds) * 100
      : 0;
  const strokeDashoffset = 282.7 - (282.7 * progressPct) / 100;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="focus-modal-box">
        {/* Header */}
        <div className="focus-header">
          <div className="focus-header-title">
            <div className="focus-icon-wrap">
              <Clock size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="focus-title">Deep Work Focus Engine</h3>
                <button
                  type="button"
                  onClick={() => setShowInfo((prev) => !prev)}
                  title="What is this? Click for info"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Info size={15} />
                </button>
              </div>
              <p className="focus-subtitle">
                Pomodoro Productivity Timer · Persists across page refresh
              </p>
            </div>
          </div>
          <button className="focus-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Info Explainer Box */}
        {showInfo && (
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(124, 58, 237, 0.1)',
              borderBottom: '1px solid rgba(124, 58, 237, 0.25)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#fff' }}>🎯 Iska matlab kya hai? (What is this?)</strong>
            <p style={{ margin: '4px 0 0' }}>
              Yeh <strong>Pomodoro Deep Work technique</strong> hai: 25 minutes bina distraction ke
              ek single task par kaam karein, fir 5 minute break lein. Aap niche kisi bhi task ko attach
              kar sakte hain aur session complete hone par 1-click se complete mark kar sakte hain.
              Ab timer <strong>page refresh hone par bhi reset nahi hoga</strong> aur smoothly continue
              rahega!
            </p>
          </div>
        )}

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
              onChange={(e) => handleTaskSelect(e.target.value)}
            >
              <option value="">-- Attach a task to this session (Optional) --</option>
              {safeTasks
                .filter((t) => t.status !== 'done')
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({(t.priority || 'medium').toUpperCase()})
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
