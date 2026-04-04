import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Tag, ExternalLink, Star, CheckCircle, Search, Filter, ChevronDown, ChevronUp, User, Video, MapPin as MapPinIcon } from 'lucide-react';

const StudentEventsDisplay = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    type: 'All',
    format: 'All',
    search: '',
    status: 'Approved'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [registering, setRegistering] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [filters, currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.type !== 'All') queryParams.append('type', filters.type);
      if (filters.format !== 'All') queryParams.append('format', filters.format);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status !== 'All') queryParams.append('status', filters.status);
      queryParams.append('page', currentPage);
      queryParams.append('limit', 12);

      const response = await fetch(`/api/events?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setPagination(data.pagination || {});
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        fetchEvents(); // Refresh events to update attendee count
        alert(data.message);
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Network error. Please try again.');
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUnregister = async (eventId) => {
    if (!confirm('Are you sure you want to unregister from this event?')) return;
    
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}/unregister`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        fetchEvents(); // Refresh events to update attendee count
        alert(data.message);
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to unregister from event');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert('Network error. Please try again.');
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleFeedback = async (eventId, rating, comment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        alert('Feedback submitted successfully!');
        fetchEvents(); // Refresh to update feedback
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Network error. Please try again.');
    }
  };

  const isUserRegistered = (event) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId || !event.attendees) return false;
      return event.attendees.some(attendee => 
        attendee.user && (attendee.user._id === userId || attendee.user === userId)
      );
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'Online': return <Video className="w-4 h-4" />;
      case 'Offline': return <MapPinIcon className="w-4 h-4" />;
      case 'Hybrid': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const EventCard = ({ event }) => {
    const registered = isUserRegistered(event);
    const isFull = event.currentAttendees >= event.maxAttendees;
    const isPast = new Date(event.date) < new Date();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => {
          setSelectedEvent(event);
          setShowDetails(true);
        }}
      >
        {/* Event Image */}
        {event.imageUrl && (
          <div className="h-48 bg-gray-100 relative overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {event.isFeatured && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
          </div>

          {/* Event Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {event.time}
            </div>
            <div className="flex items-center">
              {getFormatIcon(event.format)}
              <span className="ml-1">{event.format}</span>
            </div>
          </div>

          {/* Location/Venue */}
          {(event.format === 'Offline' || event.format === 'Hybrid') && event.location && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{event.location}, {event.venue}</span>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  +{event.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span className={isFull ? 'text-red-600 font-medium' : ''}>
                {event.currentAttendees}/{event.maxAttendees} registered
              </span>
              {isFull && <span className="ml-2 text-red-600 text-xs">(Full)</span>}
            </div>
            
            {/* Rating */}
            {event.feedback && event.feedback.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                <span>{(event.feedback.reduce((acc, f) => acc + f.rating, 0) / event.feedback.length).toFixed(1)}</span>
                <span className="text-gray-400 ml-1">({event.feedback.length})</span>
              </div>
            )}
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {event.organizer.profilePicture ? (
                  <img src={event.organizer.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                <p className="text-xs text-gray-600">Organizer</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!isPast && event.status === 'Approved' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {registered ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnregister(event._id);
                  }}
                  disabled={registering[event._id]}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering[event._id] ? 'Unregistering...' : 'Unregister'}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegister(event._id);
                  }}
                  disabled={registering[event._id] || isFull}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering[event._id] ? 'Registering...' : 
                   isFull ? 'Event Full' : 'Register'}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const EventDetailsModal = () => {
    if (!selectedEvent) return null;

    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    
    const registered = isUserRegistered(selectedEvent);
    const isPast = new Date(selectedEvent.date) < new Date();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setShowDetails(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Event Image */}
            {selectedEvent.imageUrl && (
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedEvent.time}
                </div>
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2" />
                  {selectedEvent.type}
                </div>
                <div className="flex items-center text-gray-600">
                  {getFormatIcon(selectedEvent.format)}
                  <span className="ml-1">{selectedEvent.format}</span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            {(selectedEvent.format === 'Offline' || selectedEvent.format === 'Hybrid') && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Location</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedEvent.venue}</p>
                      <p className="text-gray-600">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Online Meeting Link */}
            {(selectedEvent.format === 'Online' || selectedEvent.format === 'Hybrid') && selectedEvent.onlineMeetingLink && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Online Meeting</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Meeting Link</p>
                        <p className="text-sm text-gray-600 truncate max-w-md">{selectedEvent.onlineMeetingLink}</p>
                      </div>
                    </div>
                    <a
                      href={selectedEvent.onlineMeetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Meeting
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {selectedEvent.prerequisites && selectedEvent.prerequisites.filter(p => p.trim()).length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEvent.prerequisites.filter(p => p.trim()).map((prereq, index) => (
                    <li key={index} className="text-gray-700">{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {selectedEvent.learningOutcomes && selectedEvent.learningOutcomes.filter(lo => lo.trim()).length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEvent.learningOutcomes.filter(lo => lo.trim()).map((outcome, index) => (
                    <li key={index} className="text-gray-700">{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {selectedEvent.materials && selectedEvent.materials.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Materials & Resources</h4>
                <div className="space-y-2">
                  {selectedEvent.materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {material.type}
                      </span>
                      <span className="text-gray-900 font-medium">{material.name}</span>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 ml-auto"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer */}
            {selectedEvent.organizer && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Organizer</h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedEvent.organizer.profilePicture ? (
                      <img src={selectedEvent.organizer.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium text-gray-600">
                        {selectedEvent.organizer.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEvent.organizer.name}</p>
                    <p className="text-sm text-gray-600">{selectedEvent.organizer.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendees */}
            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Registered Attendees ({selectedEvent.currentAttendees}/{selectedEvent.maxAttendees})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedEvent.attendees.slice(0, 6).map((attendee, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {attendee.user.profilePicture ? (
                          <img src={attendee.user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {attendee.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attendee.user.name}</p>
                        <p className="text-xs text-gray-600">Registered {new Date(attendee.registeredAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {selectedEvent.attendees.length > 6 && (
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">+{selectedEvent.attendees.length - 6} more</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback */}
            {selectedEvent.feedback && selectedEvent.feedback.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Feedback & Reviews</h4>
                <div className="space-y-3">
                  {selectedEvent.feedback.map((feedback, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {feedback.user.name} • {new Date(feedback.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {feedback.comment && (
                        <p className="text-gray-700">{feedback.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {registered && isPast && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h4>
                
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Feedback
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFeedbackRating(rating)}
                            className="p-2"
                          >
                            <Star
                              className={`w-6 h-6 ${rating <= feedbackRating ? 'text-yellow-500 fill-current' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Share your experience..."
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleFeedback(selectedEvent._id, feedbackRating, feedbackComment)}
                        disabled={feedbackRating === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => {
                          setShowFeedbackForm(false);
                          setFeedbackRating(0);
                          setFeedbackComment('');
                        }}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Discover and register for events organized by alumni</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Webinar">Webinar</option>
              <option value="Conference">Conference</option>
              <option value="Networking">Networking</option>
              <option value="Career Fair">Career Fair</option>
              <option value="Guest Lecture">Guest Lecture</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>
            
            <select
              value={filters.format}
              onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Formats</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">No events match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {events.map(event => <EventCard key={event._id} event={event} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {currentPage} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && <EventDetailsModal />}
      </AnimatePresence>
    </div>
  );
};

export default StudentEventsDisplay;
