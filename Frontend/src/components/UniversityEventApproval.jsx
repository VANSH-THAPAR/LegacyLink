import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Tag, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Search, Filter, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const UniversityEventApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'All') queryParams.append('status', filters.status);
      if (filters.priority !== 'All') queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);

      console.log('🔍 Fetching event requests with params:', queryParams.toString());

      const response = await fetch(`/api/events/requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Event requests data:', data);
        setRequests(data.requests || []);
      } else {
        const error = await response.json();
        console.error('❌ Failed to fetch requests:', error);
      }
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, comments, createGoogleMeet = false) => {
    setActionLoading(prev => ({ ...prev, [requestId]: 'approving' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          approvalComments: comments,
          createGoogleMeet
        })
      });

      if (response.ok) {
        fetchRequests();
        setSelectedRequest(null);
        setShowDetails(false);
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleReject = async (requestId, reason, resubmissionRequired = false, resubmissionDeadline = '') => {
    setActionLoading(prev => ({ ...prev, [requestId]: 'rejecting' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejectionReason: reason,
          resubmissionRequired,
          resubmissionDeadline: resubmissionRequired ? resubmissionDeadline : null
        })
      });

      if (response.ok) {
        fetchRequests();
        setSelectedRequest(null);
        setShowDetails(false);
      } else {
        const error = await response.json();
        alert(error.msg || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Resubmission Required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RequestCard = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedRequest(request);
        setShowDetails(true);
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{request.description}</p>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
            {request.priority}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(request.date).toLocaleDateString()}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {request.time}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {request.maxAttendees} attendees
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Type:</span>
          <span className="text-sm font-medium text-gray-900">{request.type}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">Format:</span>
          <span className="text-sm font-medium text-gray-900">{request.format}</span>
        </div>
        <button className="text-blue-600 hover:text-blue-700 transition-colors">
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {request.requester && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {request.requester.profilePicture ? (
                <img src={request.requester.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {request.requester.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{request.requester.name}</p>
              <p className="text-xs text-gray-600">{request.requester.email}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const RequestDetailsModal = () => {
    if (!selectedRequest) return null;

    const [approvalComments, setApprovalComments] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [resubmissionRequired, setResubmissionRequired] = useState(false);
    const [resubmissionDeadline, setResubmissionDeadline] = useState('');
    const [createGoogleMeet, setCreateGoogleMeet] = useState(false);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Event Request Details</h2>
            <button
              onClick={() => {
                setSelectedRequest(null);
                setShowDetails(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Request Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedRequest.title}</h3>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedRequest.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedRequest.time}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {selectedRequest.maxAttendees} max
                </div>
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2" />
                  {selectedRequest.type}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Event Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Format:</span>
                  <p className="text-gray-900">{selectedRequest.format}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-900">{selectedRequest.duration}</p>
                </div>
                
                {(selectedRequest.format === 'Offline' || selectedRequest.format === 'Hybrid') && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900">{selectedRequest.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Venue:</span>
                      <p className="text-gray-900">{selectedRequest.venue}</p>
                    </div>
                  </>
                )}
                
                {(selectedRequest.format === 'Online' || selectedRequest.format === 'Hybrid') && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700">Meeting Link:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-900">{selectedRequest.onlineMeetingLink}</p>
                      <a
                        href={selectedRequest.onlineMeetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {selectedRequest.tags && selectedRequest.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {selectedRequest.prerequisites && selectedRequest.prerequisites.filter(p => p.trim()).length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedRequest.prerequisites.filter(p => p.trim()).map((prereq, index) => (
                    <li key={index} className="text-gray-700">{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {selectedRequest.learningOutcomes && selectedRequest.learningOutcomes.filter(lo => lo.trim()).length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedRequest.learningOutcomes.filter(lo => lo.trim()).map((outcome, index) => (
                    <li key={index} className="text-gray-700">{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {selectedRequest.materials && selectedRequest.materials.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Materials & Resources</h4>
                <div className="space-y-2">
                  {selectedRequest.materials.map((material, index) => (
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

            {/* Requester Information */}
            {selectedRequest.requester && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Requester Information</h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedRequest.requester.profilePicture ? (
                      <img src={selectedRequest.requester.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium text-gray-600">
                        {selectedRequest.requester.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedRequest.requester.name}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.requester.email}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.collegeName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {selectedRequest.history && selectedRequest.history.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Request History</h4>
                <div className="space-y-2">
                  {selectedRequest.history.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{entry.action}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {entry.comments && (
                          <p className="text-sm text-gray-700">{entry.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {(selectedRequest.status === 'Pending' || selectedRequest.status === 'Under Review') && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h4>
                
                <div className="space-y-4">
                  {/* Approval Section */}
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h5 className="font-medium text-green-900 mb-3">Approve Request</h5>
                    
                    <textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Add approval comments (optional)"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
                      rows={3}
                    />
                    
                    {selectedRequest.googleMeetRequested && (
                      <label className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          checked={createGoogleMeet}
                          onChange={(e) => setCreateGoogleMeet(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Create Google Meet event</span>
                      </label>
                    )}
                    
                    <button
                      onClick={() => handleApprove(selectedRequest._id, approvalComments, createGoogleMeet)}
                      disabled={actionLoading[selectedRequest._id] === 'approving'}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[selectedRequest._id] === 'approving' ? 'Approving...' : 'Approve Request'}
                    </button>
                  </div>

                  {/* Rejection Section */}
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h5 className="font-medium text-red-900 mb-3">Reject Request</h5>
                    
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide reason for rejection (required)"
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                      rows={3}
                      required
                    />
                    
                    <label className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={resubmissionRequired}
                        onChange={(e) => setResubmissionRequired(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Request resubmission</span>
                    </label>
                    
                    {resubmissionRequired && (
                      <input
                        type="date"
                        value={resubmissionDeadline}
                        onChange={(e) => setResubmissionDeadline(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                      />
                    )}
                    
                    <button
                      onClick={() => handleReject(selectedRequest._id, rejectionReason, resubmissionRequired, resubmissionDeadline)}
                      disabled={actionLoading[selectedRequest._id] === 'rejecting' || !rejectionReason.trim()}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[selectedRequest._id] === 'rejecting' ? 'Rejecting...' : 'Reject Request'}
                    </button>
                  </div>
                </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Approval Management</h1>
        <p className="text-gray-600">Review and approve event requests from alumni</p>
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
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Resubmission Required">Resubmission Required</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
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

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No event requests found</h3>
            <p className="text-gray-600">No event requests match your current filters.</p>
          </div>
        ) : (
          requests.map(request => <RequestCard key={request._id} request={request} />)
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && <RequestDetailsModal />}
      </AnimatePresence>
    </div>
  );
};

export default UniversityEventApproval;
