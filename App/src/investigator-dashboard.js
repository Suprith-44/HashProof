import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, LogOut, X, AlertCircle, Search, Filter } from 'lucide-react';

const InvestigatorDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [courtData, setCourtData] = useState({
    courtDetails: '',
    hearingDate: '',
    remarks: ''
  });
  
  // Categories for filtering
  const categories = ['Theft', 'Assault', 'Fraud', 'Harassment', 'Vandalism', 'Burglary', 'Other'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'head-investigator') {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/complaints', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        throw new Error('Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCourtInputChange = (e) => {
    const { name, value } = e.target;
    setCourtData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePushToCourt = async (e) => {
    e.preventDefault();
    
    if (!courtData.courtDetails || !courtData.hearingDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/push-to-court', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          complaintId: currentComplaint.complaintNo,
          ...courtData,
          investigatorEmail: user.email
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowCourtModal(false);
          setCourtData({
            courtDetails: '',
            hearingDate: '',
            remarks: ''
          });
          fetchComplaints();
        } else {
          throw new Error(data.error || 'Failed to push to court');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to push to court');
      }
    } catch (err) {
      console.error('Error pushing to court:', err);
      setError(err.message || 'Failed to push to court. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openCourtModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowCourtModal(true);
  };

  const openViewModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowViewModal(true);
  };

  // Filtered complaints with search and category filter
  const filteredComplaints = complaints.filter(complaint => {
    if (!complaint) return false;
    
    const title = complaint.title || '';
    const details = complaint.complaintDetails || '';
    const category = complaint.casecategory || '';
    
    const matchesSearch = searchTerm === '' || 
                         title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full grid grid-cols-12 grid-rows-6">
          {Array(72).fill().map((_, i) => (
            <div key={i} className="border border-white/10"></div>
          ))}
        </div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-blue-500/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">
            Hash<span className="text-blue-400">Proof</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-300">
            <span className="opacity-70">Logged in as </span>
            <span className="font-medium text-blue-300">Investigator</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-4 md:mb-0">
            Investigator Dashboard
          </motion.h1>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div 
          variants={containerVariants}
          className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0"
        >
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Complaints Table */}
        <motion.div 
          variants={containerVariants}
          className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 border-blue-500 rounded-full mb-4"></div>
              <p className="text-gray-400">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No complaints found</h3>
              <p className="text-gray-400">No complaints match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredComplaints.map((complaint) => (
                    <motion.tr 
                      key={complaint.complaintNo}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.complaintNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{complaint.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.casecategory}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${complaint.status === 'Open' ? 'bg-green-500/20 text-green-400' : 
                            complaint.status === 'In Court' ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-gray-500/20 text-gray-400'}`}
                        >
                          {complaint.status || 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openViewModal(complaint)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </motion.button>
                        {complaint.status !== 'In Court' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openCourtModal(complaint)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Push to Court
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Court Modal */}
      {showCourtModal && currentComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCourtModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 border border-blue-500/30 rounded-xl shadow-xl z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Push to Court</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCourtModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            
            <form onSubmit={handlePushToCourt} className="p-6">
              <div className="mb-6">
                <label htmlFor="courtDetails" className="block text-gray-300 mb-2 text-sm font-medium">
                  Court Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="courtDetails"
                  name="courtDetails"
                  value={courtData.courtDetails}
                  onChange={handleCourtInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 rounded-lg bg-gray-700/70 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                  placeholder="Enter court and case details"
                ></textarea>
              </div>

              <div className="mb-6">
                <label htmlFor="hearingDate" className="block text-gray-300 mb-2 text-sm font-medium">
                  Hearing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="hearingDate"
                  name="hearingDate"
                  value={courtData.hearingDate}
                  onChange={handleCourtInputChange}
                  className="block w-full px-3 py-2 rounded-lg bg-gray-700/70 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="remarks" className="block text-gray-300 mb-2 text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={courtData.remarks}
                  onChange={handleCourtInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 rounded-lg bg-gray-700/70 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                  placeholder="Any additional remarks"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-700 space-x-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCourtModal(false)}
                  className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className={`py-2 px-6 ${submitting ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} rounded-lg text-white font-medium flex items-center space-x-2`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Push to Court</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ... View Modal similar to examiner dashboard ... */}
      {showViewModal && currentComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70" onClick={() => setShowViewModal(false)}></div>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 border border-blue-500/30 rounded-xl shadow-xl z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Complaint Details</h2>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white"
            >
                <X className="h-6 w-6" />
            </motion.button>
            </div>
            
            <div className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Title</h3>
                <p className="text-gray-400">{currentComplaint.title}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Date</h3>
                <p className="text-gray-400">{currentComplaint.date}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Place</h3>
                <p className="text-gray-400">{currentComplaint.place}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Category</h3>
                <p className="text-gray-400">{currentComplaint.casecategory}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Severity</h3>
                <p className="text-gray-400">{currentComplaint.severity}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Complaint Details</h3>
                <p className="text-gray-400">{currentComplaint.complaintDetails}</p>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Evidence Details</h3>
                <p className="text-gray-400">{currentComplaint.evidenceDetails}</p>
            </div>
            
            {currentComplaint.inference && (
                <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Inference</h3>
                <p className="text-gray-400">{currentComplaint.inference}</p>
                </div>
            )}
            
            {currentComplaint.files && currentComplaint.files.length > 0 && (
                <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Evidence Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {currentComplaint.files.map((file, index) => (
                    <img 
                        key={index} 
                        src={file} 
                        alt={`Evidence ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-lg border border-gray-600"
                    />
                    ))}
                </div>
                </div>
            )}
            </div>
        </motion.div>
        </div>
      )}
    </div>
  );
};

export default InvestigatorDashboard;