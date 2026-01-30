import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon, CalendarIcon } from 'lucide-react';

const ViewFunds = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('yearly');

    // Hardcoded demo data
    const fundsData = {
        totalRaised: 2456780,
        totalGoal: 3000000,
        monthlyTarget: 250000,
        campaigns: [
            {
                id: 1,
                name: "Alumni Scholarship Fund",
                raised: 450000,
                goal: 500000,
                donors: 234,
                endDate: "2024-06-30",
                status: "active"
            },
            {
                id: 2,
                name: "Infrastructure Development",
                raised: 780000,
                goal: 1000000,
                donors: 156,
                endDate: "2024-12-31",
                status: "active"
            },
            {
                id: 3,
                name: "Research Excellence Fund",
                raised: 320000,
                goal: 400000,
                donors: 89,
                endDate: "2024-09-30",
                status: "active"
            },
            {
                id: 4,
                name: "Sports Complex Renovation",
                raised: 567800,
                goal: 600000,
                donors: 178,
                endDate: "2024-03-31",
                status: "completed"
            },
            {
                id: 5,
                name: "Library Modernization",
                raised: 339000,
                goal: 500000,
                donors: 67,
                endDate: "2024-08-31",
                status: "active"
            }
        ],
        monthlyDonations: [
            { month: 'Jan', amount: 185000 },
            { month: 'Feb', amount: 198000 },
            { month: 'Mar', amount: 223000 },
            { month: 'Apr', amount: 267000 },
            { month: 'May', amount: 245000 },
            { month: 'Jun', amount: 289000 }
        ],
        recentDonations: [
            {
                id: 1,
                donor: "Rajesh Kumar",
                amount: 50000,
                campaign: "Alumni Scholarship Fund",
                date: "2024-06-15",
                type: "one-time"
            },
            {
                id: 2,
                donor: "Priya Sharma",
                amount: 25000,
                campaign: "Infrastructure Development",
                date: "2024-06-14",
                type: "monthly"
            },
            {
                id: 3,
                donor: "Amit Patel",
                amount: 100000,
                campaign: "Research Excellence Fund",
                date: "2024-06-13",
                type: "one-time"
            },
            {
                id: 4,
                donor: "Neha Gupta",
                amount: 15000,
                campaign: "Library Modernization",
                date: "2024-06-12",
                type: "monthly"
            }
        ]
    };

    const progressPercentage = (fundsData.totalRaised / fundsData.totalGoal) * 100;

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <header className="mb-8">
                    <Link to="/university-dashboard" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">University Funds</h1>
                    <p className="mt-2 text-lg text-slate-600">Manage and track fundraising campaigns and donations</p>
                </header>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Raised</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    ${fundsData.totalRaised.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSignIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Goal Progress</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    {progressPercentage.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <TrendingUpIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Campaigns</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    {fundsData.campaigns.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <CalendarIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Donors</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    {fundsData.campaigns.reduce((sum, c) => sum + c.donors, 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <TrendingUpIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">Overall Fundraising Progress</h3>
                        <span className="text-sm text-slate-500">
                            ${fundsData.totalRaised.toLocaleString()} / ${fundsData.totalGoal.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-2xl shadow-sm mb-8">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">Active Campaigns</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Raised</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Goal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Donors</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {fundsData.campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                                                <div className="text-xs text-slate-500">Ends: {campaign.endDate}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            ${campaign.raised.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            ${campaign.goal.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            campaign.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}
                                                        style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-600">
                                                    {((campaign.raised / campaign.goal) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {campaign.donors}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                campaign.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-white rounded-2xl shadow-sm">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">Recent Donations</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {fundsData.recentDonations.map((donation) => (
                                <div key={donation.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-semibold">
                                                {donation.donor.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-slate-900">{donation.donor}</p>
                                            <p className="text-xs text-slate-500">{donation.campaign}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">${donation.amount.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">{donation.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViewFunds;
