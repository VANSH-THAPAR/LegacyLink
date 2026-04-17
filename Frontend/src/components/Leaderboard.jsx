import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, TrendingUp, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/alumni/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaders(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 1: return 'bg-slate-100 text-slate-500 border-slate-200';
      case 2: return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-slate-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="font-bold">{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50 flex items-center gap-3">
        <Trophy className="w-6 h-6 text-cyan-600" />
        <h2 className="text-xl font-bold text-slate-800">Alumni Leaderboard</h2>
      </div>
      
      <div className="p-0">
        {leaders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No alumni data available for leaderboard yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaders.map((alumni, index) => (
              <div 
                key={alumni._id} 
                className={`p-4 flex items-center gap-4 transition hover:bg-slate-50 ${index < 3 ? 'bg-slate-50/50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getRankColor(index)}`}>
                  {getRankIcon(index)}
                </div>
                
                <div className="relative">
                  <img
                    src={alumni.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&background=random`}
                    alt={alumni.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {alumni.name}
                    {index === 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Top Contributor</span>}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {alumni.position} {alumni.company ? `at ${alumni.company}` : ''}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-cyan-600 font-bold text-lg">
                    {alumni.score || 0}
                    <TrendingUp className="w-4 h-4 ml-1" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">SCORE</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;