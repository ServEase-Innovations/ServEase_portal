// components/Dashboard/shared/ActionButtons.tsx
import React from 'react';

export type ActionButton = {
  onClick: () => void;
  disabled?: boolean;
  colorClass: string;
  label: string;
  loadingLabel?: string;
};

interface ActionButtonsProps {
  buttons: ActionButton[];
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ buttons }) => {
  return (
    <>
      {buttons.map((btn) => (
        <button
          key={`action-${btn.label}`}
          type="button"
          onClick={btn.onClick}
          disabled={btn.disabled}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl text-xs sm:text-sm font-medium transition-all ${btn.colorClass}`}
        >
          {btn.disabled && btn.loadingLabel ? btn.loadingLabel : btn.label}
        </button>
      ))}
    </>
  );
};

// Helper function to generate action buttons based on state
export const getActionButtonsForState = (
  isClockedIn: boolean,
  isClockedOut: boolean,
  workStatus: 'working' | 'on-leave' | 'not-working',
  attendanceLoading: boolean,
  handlers: {
    handleStartWork: () => void;
    handleStopWork: () => void;
    handleResumeWork: () => void;
    setShowLeaveModal: (show: boolean) => void;
  }
): ActionButton[] => {
  const { handleStartWork, handleStopWork, handleResumeWork, setShowLeaveModal } = handlers;

  if (!isClockedIn && !isClockedOut && workStatus === 'not-working') {
    return [
      {
        onClick: handleStartWork,
        disabled: attendanceLoading,
        colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
        label: '✅ Working Today',
        loadingLabel: '⏳ Processing...'
      },
      {
        onClick: () => setShowLeaveModal(true),
        colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
        label: '📋 On Leave'
      }
    ];
  }

  if (isClockedIn) {
    return [{
      onClick: handleStopWork,
      disabled: attendanceLoading,
      colorClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
      label: '⏹️ Stop Working',
      loadingLabel: '⏳ Processing...'
    }];
  }

  if (isClockedOut) {
    return [{
      onClick: handleResumeWork,
      disabled: attendanceLoading,
      colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
      label: '▶️ Resume Work',
      loadingLabel: '⏳ Resuming...'
    }];
  }

  if (workStatus === 'on-leave') {
    return [{
      onClick: () => setShowLeaveModal(true),
      colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
      label: '✏️ Modify Leave'
    }];
  }

  return [];
};
