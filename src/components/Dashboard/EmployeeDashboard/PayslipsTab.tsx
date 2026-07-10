// tabs/PayslipsTab.tsx
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getThemeClasses } from './themeUtils';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface PayslipsTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface PayslipData {
  employeeId: string;
  name: string;
  designation: string;
  email: string;
  payPeriod: string;
  paymentDate: string;
  earnings: {
    basic: number;
    hra: number;
    special: number;
    performanceBonus: number;
  };
  deductions: {
    providentFund: number;
    tds: number;
    professionalTax: number;
  };
}

const PayslipsTab: React.FC<PayslipsTabProps> = ({ theme, attendance }) => {
  const { user } = useAuth();
  const tc = getThemeClasses(theme);

  const generatePayslipData = (employeeName?: string): PayslipData => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    return {
      employeeId: user?.id || 'SE-118',
      name: employeeName || user?.name || 'Karan Singh',
      designation: ((user as any)?.designation) || 'Backend Engineer',
      email: user?.email || 'karan.singh@serveasein.com',
      payPeriod: 'May 2026',
      paymentDate: '2026-05-31',
      earnings: {
        basic: baseSalary,
        hra: hra,
        special: special,
        performanceBonus: bonus,
      },
      deductions: {
        providentFund: pf,
        tds: tds,
        professionalTax: pt,
      }
    };
  };

  const downloadPayslip = (employeeName?: string) => {
    const data = generatePayslipData(employeeName);
    
    const totalEarnings = Object.values(data.earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(data.deductions).reduce((a, b) => a + b, 0);
    const netPayable = totalEarnings - totalDeductions;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f0f2f5; 
            padding: 20px;
          }
          .payslip { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #1a2744 0%, #2a3f6a 100%); 
            color: white; 
            padding: 25px 30px;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
          }
          .header h1 { 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: 1px;
          }
          .header .sub { 
            opacity: 0.8; 
            font-size: 13px; 
            font-weight: 300;
            margin-top: 4px;
          }
          .header .company { 
            font-size: 11px; 
            opacity: 0.6; 
            margin-top: 6px;
          }
          .header .badge {
            float: right;
            background: rgba(255,255,255,0.15);
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 11px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .employee-details { 
            padding: 20px 30px; 
            background: #f8fafc; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 6px 20px; 
            border-bottom: 2px solid #e2e8f0;
          }
          .employee-details .label { 
            color: #64748b; 
            font-size: 10px; 
            font-weight: 600; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .employee-details .value { 
            color: #0f172a; 
            font-size: 13px; 
            font-weight: 500;
          }
          .table-section { 
            padding: 25px 30px; 
          }
          .table-section h2 { 
            font-size: 15px; 
            color: #1a2744; 
            margin-bottom: 16px;
            font-weight: 600;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
          }
          th { 
            background: #f1f5f9; 
            color: #475569; 
            font-weight: 600; 
            font-size: 11px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 14px; 
            text-align: left; 
            border-bottom: 2px solid #e2e8f0;
          }
          td { 
            padding: 10px 14px; 
            border-bottom: 1px solid #f1f5f9; 
            font-size: 13px;
          }
          .total-row { 
            background: #f8fafc; 
            font-weight: 600;
          }
          .total-row td {
            border-bottom: 2px solid #e2e8f0;
          }
          .net-row {
            background: #ecfdf5;
          }
          .net-row td {
            border-bottom: none;
            padding: 14px;
          }
          .amount { 
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }
          .footer { 
            padding: 16px 30px; 
            background: #f8fafc; 
            border-top: 2px solid #e2e8f0; 
            font-size: 11px; 
            color: #94a3b8; 
            text-align: center;
          }
          .footer strong {
            color: #64748b;
          }
          @media print {
            body { padding: 0; background: white; }
            .payslip { box-shadow: none; border-radius: 0; }
          }
          @media (max-width: 600px) {
            .header { padding: 20px; }
            .header .badge { float: none; display: inline-block; margin-top: 10px; }
            .employee-details { grid-template-columns: 1fr; padding: 15px 20px; }
            .table-section { padding: 15px 20px; }
            td, th { padding: 8px 10px; font-size: 12px; }
            .footer { padding: 12px 20px; font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <h1>ServEase</h1>
            <div class="sub">INNOVATION PVT LTD</div>
            <div class="company">TOWER B, Cyber Hub, Gurugram, Haryana 122002, India</div>
            <div class="badge">📄 PAYSLIP</div>
          </div>
          
          <div class="employee-details">
            <div><span class="label">Employee ID</span><div class="value">${data.employeeId}</div></div>
            <div><span class="label">Name</span><div class="value">${data.name}</div></div>
            <div><span class="label">Designation</span><div class="value">${data.designation}</div></div>
            <div><span class="label">Email</span><div class="value">${data.email}</div></div>
            <div><span class="label">Pay Period</span><div class="value">${data.payPeriod}</div></div>
            <div><span class="label">Payment Date</span><div class="value">${data.paymentDate}</div></div>
          </div>

          <div class="table-section">
            <h2>📊 Salary Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th style="width:40%">Earnings</th>
                  <th style="width:10%;text-align:right">Amount</th>
                  <th style="width:40%">Deductions</th>
                  <th style="width:10%;text-align:right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💰 Basic</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.basic.toLocaleString()}</td>
                  <td>🏦 Provident Fund</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.providentFund.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>🏠 House Rent Allowance</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.hra.toLocaleString()}</td>
                  <td>📊 TDS</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.tds.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>⭐ Special Allowance</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.special.toLocaleString()}</td>
                  <td>📋 Professional Tax</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.professionalTax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>🎯 Performance Bonus</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.performanceBonus.toLocaleString()}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr class="total-row">
                  <td><strong>📈 Total Earnings</strong></td>
                  <td style="text-align:right" class="amount"><strong>₹${totalEarnings.toLocaleString()}</strong></td>
                  <td><strong>📉 Total Deductions</strong></td>
                  <td style="text-align:right" class="amount"><strong>₹${totalDeductions.toLocaleString()}</strong></td>
                </tr>
                <tr class="net-row">
                  <td colspan="3" style="text-align:right; font-size:16px; font-weight:700; color:#065f46;">
                    💰 Net Payable
                  </td>
                  <td style="text-align:right; font-size:18px; font-weight:700; color:#065f46;" class="amount">
                    ₹${netPayable.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            This is a system-generated payslip and does not require a signature.<br>
            <strong>© 2026 ServEase Innovation Private Limited</strong> • All rights reserved
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${data.employeeId}_${data.payPeriod.replace(' ', '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const payslips = [
    { month: 'May 2026', paidOn: '2026-05-31', gross: '₹1,45,390', net: '₹1,18,849' },
    { month: 'April 2026', paidOn: '2026-04-30', gross: '₹1,42,500', net: '₹1,16,535' },
    { month: 'March 2026', paidOn: '2026-03-31', gross: '₹1,42,500', net: '₹1,16,535' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>4 / 10</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>9 / 18</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Total Earned</h4>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">₹3,52,274</p>
          <p className={`text-xs ${tc.textMuted}`}>last 3 months</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className={`font-semibold ${tc.text} mb-1 text-base sm:text-lg`}>Payslips</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Download your monthly payslip with ServEase branding</p>
          </div>
          <button
            type="button"
            onClick={() => downloadPayslip()}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center gap-2 hover:scale-105`}
          >
            <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Generate Current
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {payslips.map((payslip, index) => (
            <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 ${tc.border} border rounded-2xl ${tc.bgCardHover} transition-all duration-300 hover:shadow-md hover:scale-[1.01] gap-3 sm:gap-0`}>
              <div>
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${tc.textMuted}`} />
                  <div>
                    <h4 className={`font-semibold ${tc.text} text-sm sm:text-base`}>{payslip.month}</h4>
                    <p className={`text-xs ${tc.textMuted}`}>Paid on {payslip.paidOn}</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-2 ml-9 sm:ml-11">
                  <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>Gross: <span className={`font-medium ${tc.text}`}>{payslip.gross}</span></span>
                  <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>Net: <span className="font-medium text-emerald-400">{payslip.net}</span></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => downloadPayslip()}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium hover:scale-105 self-start sm:self-center`}
              >
                <ArrowUpTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayslipsTab;