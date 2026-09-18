import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { studentService } from '../../services/studentService';
import StudentHostelCard from '../../components/StudentHostelCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const HostelsDiscoveryPage = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const data = await studentService.getApprovedHostels();
      setHostels(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hostels:', err);
      setError('Failed to load hostels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHostels = hostels.filter((hostel) =>
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Discover Hostels
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Find and explore approved hostels that match your needs.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/50 backdrop-blur-xl border border-white p-2 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hostels by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredHostels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 border border-white rounded-2xl">
          <p className="text-slate-500 font-medium">No approved hostels found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHostels.map((hostel) => (
            <StudentHostelCard key={hostel._id} hostel={hostel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelsDiscoveryPage;
