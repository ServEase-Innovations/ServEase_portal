import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  ClockIcon, 
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UsersIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import { payslipAutomationApi } from '../../../../services/api';
import { 
  PayslipAutomationStatus, 
  PayslipGenerationRequest, 
  PayslipHistoricalRequest,
  PayslipCoverageAnalysis 
} from '../../../../types';

interface PayslipAutomationProps {
  tc: ThemeClasses;
}

const PayslipAutomation: React.FC<PayslipAutomationProps> = ({ tc }) => {
  const [automationStatus, setAutomationStatus] = useState<PayslipAutomationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistoricalModal, setShowHistoricalModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [historicalProgress, setHistoricalProgress] = useState<any>(null);
  const [coverageAnalysis, setCoverageAnalysis] = useState<PayslipCoverageAnalysis | null>(null);

  // Load automation status
  useEffect(() => {
    loadAutomationStatus();
  }, []);

  const loadAutomationStatus = async () => {
    try {
      setIsLoading(true);
      const response = await payslipAutomationApi.getStatus();
      setAutomationStatus(response);
    } catch (error) {
      console.error('Failed to load automation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScheduler = async () => {
    try {
      if (automationStatus?.scheduler?.enabled) {
        await payslipAutomationApi.stopScheduler();
      } else {
        await payslipAutomationApi.startScheduler();
      }
      await loadAutomationStatus();
    } catch (error) {
      console.error('Failed to toggle scheduler:', error);
    }
  };

  const generateHistoricalPayslips = async () => {
    try {
      const request: PayslipHistoricalRequest = {
        startDate: '2026-01-01',
        endDate: new Date().toISOString().split('T')[0]
      };
      
      const response = await payslipAutomationApi.generateHistorical(request);
      setHistoricalProgress(response);
      setShowHistoricalModal(true);
    } catch (error) {
      console.error('Failed to start historical generation:', error);
    }
  };
  const analyzeCoverage = async () => {
    try {
      const response = await payslipAutomationApi.getCoverageAnalysis();
      setCoverageAnalysis(response);
      setShowCoverageModal(true);
    } catch (error) {
      console.error('Failed to analyze coverage:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`${tc.bgCard} p-8 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className={`ml-3 text-lg ${tc.text}`}>Loading automation settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <CogIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${tc.text}`}>Payslip Automation</h2>
            <p className={`text-sm ${tc.textSecondary}`}>
              Manage automated payslip generation and historical records
            </p>
          </div>
        </div>
      </div>

      {/* Scheduler Status Card */}
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClockIcon className={`w-6 h-6 ${automationStatus?.scheduler?.enabled ? 'text-emerald-400' : 'text-gray-400'}`} />
              <div>
                <h3 className={`text-lg font-semibold ${tc.text}`}>Monthly Scheduler</h3>
                <p className={`text-sm ${tc.textSecondary}`}>
                  Automatic payslip generation on last day of each month
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                automationStatus?.scheduler?.enabled 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {automationStatus?.scheduler?.enabled ? 'Active' : 'Inactive'}
              </div>
              
              <button
                onClick={toggleScheduler}
                className={`p-2 rounded-xl transition-all ${
                  automationStatus?.scheduler?.enabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {automationStatus?.scheduler?.enabled ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Scheduler Details */}
          {automationStatus?.scheduler && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span className={`text-sm font-medium ${tc.text}`}>Next Run</span>
                </div>
                <p className={`text-sm ${tc.textSecondary}`}>
                  {automationStatus.scheduler.nextRun 
                    ? new Date(automationStatus.scheduler.nextRun).toLocaleString()
                    : 'Not scheduled'
                  }
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-indigo-400" />
                  <span className={`text-sm font-medium ${tc.text}`}>Last Run</span>
                </div>
                <p className={`text-sm ${tc.textSecondary}`}>
                  {automationStatus.scheduler.lastRun 
                    ? new Date(automationStatus.scheduler.lastRun).toLocaleString()
                    : 'Never run'
                  }
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
                  <span className={`text-sm font-medium ${tc.text}`}>Schedule</span>
                </div>
                <p className={`text-sm ${tc.textSecondary}`}>
                  Last day of month at 11:59 PM
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Historical Generation */}
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className={`text-lg font-semibold ${tc.text} mb-2`}>Historical Payslips</h3>
            <p className={`text-sm ${tc.textSecondary} mb-4`}>
              Generate payslips for January 2026 to current date for all employees
            </p>
            
            <button
              onClick={generateHistoricalPayslips}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Generate Historical
            </button>
          </div>
        </div>
        
        {/* Coverage Analysis */}
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className={`text-lg font-semibold ${tc.text} mb-2`}>Coverage Analysis</h3>
            <p className={`text-sm ${tc.textSecondary} mb-4`}>
              Analyze payslip coverage and identify missing records
            </p>
            
            <button
              onClick={analyzeCoverage}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              Analyze Coverage
            </button>
          </div>
        </div>

        {/* Bulk Generation */}
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className={`text-lg font-semibold ${tc.text} mb-2`}>Current Month</h3>
            <p className={`text-sm ${tc.textSecondary} mb-4`}>
              Generate payslips for current month for all employees
            </p>
            
            <button
              onClick={() => {
                // Will implement current month generation
                console.log('Generate current month payslips');
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Generate Current
            </button>
          </div>
        </div>
      </div>
      
      {/* Historical Generation Modal */}
      {showHistoricalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-md w-full p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${tc.text}`}>Historical Generation</h3>
                <p className={`text-sm ${tc.textSecondary}`}>Generating payslips for all employees</p>
              </div>
            </div>
            
            {historicalProgress && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${tc.text}`}>Progress</span>
                    <span className={`text-sm ${tc.textSecondary}`}>
                      {historicalProgress.processed || 0} / {historicalProgress.total || 0}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-700 rounded-full h-2`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${historicalProgress.total ? (historicalProgress.processed / historicalProgress.total * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                {historicalProgress.errors && historicalProgress.errors.length > 0 && (
                  <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/30`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Errors</span>
                    </div>
                    <div className="text-xs text-red-300 space-y-1">
                      {historicalProgress.errors.slice(0, 3).map((error: string, index: number) => (
                        <div key={index}>{error}</div>
                      ))}
                      {historicalProgress.errors.length > 3 && (
                        <div>+ {historicalProgress.errors.length - 3} more errors</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHistoricalModal(false)}
                className={`flex-1 px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl font-medium hover:${tc.bgCardHover} transition-all`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Coverage Analysis Modal */}
      {showCoverageModal && coverageAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${tc.text}`}>Coverage Analysis</h3>
                  <p className={`text-sm ${tc.textSecondary}`}>Payslip coverage from January 2026 to present</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoverageModal(false)}
                className={`p-2 rounded-xl ${tc.btnBg} hover:bg-opacity-80 transition-all`}
              >
                ×
              </button>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="w-4 h-4 text-indigo-400" />
                  <span className={`text-xs ${tc.textSecondary}`}>Total Employees</span>
                </div>
                <p className={`text-lg font-bold ${tc.text}`}>{coverageAnalysis.totalEmployees}</p>
              </div>
              
              <div className={`p-4 rounded-xl ${tc.bgInput}`}>
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <span className={`text-xs ${tc.textSecondary}`}>Months Analyzed</span>
                </div>
                <p className={`text-lg font-bold ${tc.text}`}>{coverageAnalysis.monthsAnalyzed}</p>
              </div>
              
              <div className={`p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  <span className={`text-xs ${tc.textSecondary}`}>Generated</span>
                </div>
                <p className={`text-lg font-bold text-emerald-400`}>{coverageAnalysis.generatedPayslips}</p>
              </div>
              
              <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/30`}>
                <div className="flex items-center gap-2 mb-1">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                  <span className={`text-xs ${tc.textSecondary}`}>Missing</span>
                </div>
                <p className={`text-lg font-bold text-red-400`}>{coverageAnalysis.missingPayslips}</p>
              </div>
            </div>
            
            {/* Coverage Progress */}
            <div className={`p-4 rounded-xl ${tc.bgInput} mb-6`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${tc.text}`}>Overall Coverage</span>
                <span className={`text-sm ${tc.textSecondary}`}>
                  {Math.round(coverageAnalysis.coveragePercentage)}%
                </span>
              </div>
              <div className={`w-full bg-gray-700 rounded-full h-3`}>
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${coverageAnalysis.coveragePercentage}%` }}
                />
              </div>
            </div>
            
            {/* Missing Records */}
            {coverageAnalysis.missingRecords && coverageAnalysis.missingRecords.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium ${tc.text} mb-3 flex items-center gap-2`}>
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                  Missing Records ({coverageAnalysis.missingRecords.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {coverageAnalysis.missingRecords.map((record: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`text-sm font-medium text-red-400`}>{record.employeeName}</span>
                          <span className={`text-xs ${tc.textMuted} ml-2`}>({record.employeeId})</span>
                        </div>
                        <span className={`text-xs text-red-300`}>{record.monthYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCoverageModal(false)}
                className={`flex-1 px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl font-medium hover:${tc.bgCardHover} transition-all`}
              >
                Close
              </button>
              {coverageAnalysis.missingPayslips > 0 && (
                <button
                  onClick={() => {
                    setShowCoverageModal(false);
                    generateHistoricalPayslips();
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
                >
                  Fix Missing Records
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipAutomation;