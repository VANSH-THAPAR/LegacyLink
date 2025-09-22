import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calendar, MapPin, Users, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EventsPageWithBackend = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        search: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);

            const response = await fetch(`${API_URL}/events?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const registerForEvent = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setRegisteredEvents(prev => [...prev, eventId]);
                alert('Successfully registered for the event!');
            }
        } catch (error) {
            console.error('Error registering for event:', error);
        }
    };

    const createEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                fetchEvents(); // Refresh events list
                alert('Event created successfully!');
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Events Center</h2>
                <p className="text-slate-500 mt-1">Discover and participate in alumni events and activities.</p>
            </div>

            {/* Filters */}
            <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full py-3 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full py-3 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Event Types</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Networking">Networking</option>
                        <option value="Career Fair">Career Fair</option>
                        <option value="Alumni Meet">Alumni Meet</option>
                    </select>
                    <button
                        onClick={() => {
                            const title = prompt('Event Title:');
                            const description = prompt('Event Description:');
                            const type = prompt('Event Type (Workshop/Seminar/etc):');
                            const date = prompt('Event Date (YYYY-MM-DD):');
                            const location = prompt('Event Location:');
                            
                            if (title && description && type && date && location) {
                                createEvent({ title, description, type, date, location });
                            }
                        }}
                        className="w-full bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        Create Event
                    </button>
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500">Loading events...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No events found matching your criteria.
                        </div>
                    ) : (
                        events.map((event, i) => (
                            <motion.div 
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>
                                    <span className="bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full ml-4">
                                        {event.type}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar size={16}/>
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    {event.time && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock size={16}/>
                                            {event.time}
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <MapPin size={16}/>
                                            {event.location}
                                        </div>
                                    )}
                                    {event.attendees && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Users size={16}/>
                                            {event.attendees} attendees
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    {registeredEvents.includes(event._id) ? (
                                        <button 
                                            disabled
                                            className="flex-1 bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Check size={16}/> Registered
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => registerForEvent(event._id)}
                                            className="flex-1 bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
                                        >
                                            Register
                                        </button>
                                    )}
                                    <button className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors">
                                        Details
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default EventsPageWithBackend;
