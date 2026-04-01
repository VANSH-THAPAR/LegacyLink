import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DownloadIcon, CalendarIcon, FileTextIcon, UsersIcon, TrendingUpIcon, DollarSignIcon } from 'lucide-react';

const GenerateReports = () => {
    const [selectedReportType, setSelectedReportType] = useState('alumni');
    const [dateRange, setDateRange] = useState('this-year');
    const [format, setFormat] = useState('pdf');

    // Hardcoded demo data
    const reportTypes = [
        {
            id: 'alumni',
            name: 'Alumni Report',
            description: 'Comprehensive alumni statistics, demographics, and engagement metrics',
            icon: UsersIcon,
            color: 'blue',
            availableFormats: ['pdf', 'excel', 'csv']
        },
        {
            id: 'financial',
            name: 'Financial Report',
            description: 'Fundraising campaigns, donations, and financial performance analysis',
            icon: DollarSignIcon,
            color: 'green',
            availableFormats: ['pdf', 'excel']
        },
        {
            id: 'engagement',
            name: 'Engagement Report',
            description: 'Event participation, platform usage, and community engagement metrics',
            icon: TrendingUpIcon,
            color: 'purple',
            availableFormats: ['pdf', 'excel', 'csv']
        },
        {
            id: 'academic',
            name: 'Academic Performance',
            description: 'Student achievements, research publications, and academic metrics',
            icon: FileTextIcon,
            color: 'indigo',
            availableFormats: ['pdf', 'excel']
        }
    ];

    const recentReports = [
        {
            id: 1,
            name: 'Q1 2024 Alumni Report',
            type: 'alumni',
            format: 'pdf',
            generatedDate: '2024-04-01',
            size: '2.4 MB',
            generatedBy: 'Admin User'
        },
        {
            id: 2,
            name: 'Annual Financial Summary 2023',
            type: 'financial',
            format: 'excel',
            generatedDate: '2024-01-15',
            size: '1.8 MB',
            generatedBy: 'Finance Team'
        },
        {
            id: 3,
            name: 'December Engagement Metrics',
            type: 'engagement',
            format: 'pdf',
            generatedDate: '2024-01-02',
            size: '3.1 MB',
            generatedBy: 'Admin User'
        },
        {
            id: 4,
            name: 'Research Publications Report',
            type: 'academic',
            format: 'pdf',
            generatedDate: '2023-12-20',
            size: '4.2 MB',
            generatedBy: 'Academic Affairs'
        }
    ];

    const scheduledReports = [
        {
            id: 1,
            name: 'Monthly Alumni Statistics',
            type: 'alumni',
            frequency: 'monthly',
            nextRun: '2024-07-01',
            recipients: ['admin@university.edu', 'alumni@university.edu'],
            format: 'pdf'
        },
        {
            id: 2,
            name: 'Quarterly Financial Report',
            type: 'financial',
            frequency: 'quarterly',
            nextRun: '2024-07-15',
            recipients: ['finance@university.edu', 'director@university.edu'],
            format: 'excel'
        },
        {
            id: 3,
            name: 'Weekly Engagement Summary',
            type: 'engagement',
            frequency: 'weekly',
            nextRun: '2024-06-24',
            recipients: ['marketing@university.edu'],
            format: 'csv'
        }
    ];

    const handleGenerateReport = () => {
        // Simulate report generation
        alert(`Generating ${selectedReportType} report in ${format} format for ${dateRange}`);
    };

    const handleDownloadReport = (reportId) => {
        // Simulate download
        alert(`Downloading report ${reportId}`);
    };

    const selectedReport = reportTypes.find(r => r.id === selectedReportType);

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <header className="mb-8">
                    <Link to="/university-dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Generate Reports</h1>
                    <p className="mt-2 text-lg text-slate-600">Create, schedule, and manage university reports</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Report Generator */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Report Type Selection */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Report Type</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportTypes.map((report) => {
                                    const IconComponent = report.icon;
                                    return (
                                        <button
                                            key={report.id}
                                            onClick={() => setSelectedReportType(report.id)}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                selectedReportType === report.id
                                                    ? `border-${report.color}-500 bg-${report.color}-50`
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg bg-${report.color}-100`}>
                                                    <IconComponent className={`w-5 h-5 text-${report.color}-600`} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-medium text-slate-900">{report.name}</h3>
                                                    <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Report Configuration */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Report Configuration</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Date Range
                                    </label>
                                    <select 
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="this-month">This Month</option>
                                        <option value="last-month">Last Month</option>
                                        <option value="this-quarter">This Quarter</option>
                                        <option value="last-quarter">Last Quarter</option>
                                        <option value="this-year">This Year</option>
                                        <option value="last-year">Last Year</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Export Format
                                    </label>
                                    <div className="flex space-x-4">
                                        {selectedReport?.availableFormats.map((fmt) => (
                                            <label key={fmt} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={fmt}
                                                    checked={format === fmt}
                                                    onChange={(e) => setFormat(e.target.value)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm font-medium text-slate-700 uppercase">{fmt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Additional Options
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" defaultChecked />
                                            <span className="text-sm text-slate-700">Include charts and graphs</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" defaultChecked />
                                            <span className="text-sm text-slate-700">Include detailed breakdowns</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span className="text-sm text-slate-700">Send via email when ready</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recent Reports */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Reports</h3>
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <div key={report.id} className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-slate-900">{report.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {report.generatedDate} • {report.size}
                                                </p>
                                                <p className="text-xs text-slate-400">by {report.generatedBy}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadReport(report.id)}
                                                className="p-1 text-indigo-600 hover:text-indigo-800"
                                            >
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scheduled Reports */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Scheduled Reports</h3>
                            <div className="space-y-3">
                                {scheduledReports.map((report) => (
                                    <div key={report.id} className="p-3 bg-slate-50 rounded-lg">
                                        <h4 className="text-sm font-medium text-slate-900">{report.name}</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {report.frequency} • Next: {report.nextRun}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {report.recipients.length} recipients
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GenerateReports;
