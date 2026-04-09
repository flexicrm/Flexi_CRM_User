// pages/ProfilePage.tsx
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import { fetchUserProfile } from '../../store/homepage_slice/Profile_Slice';
import type { AppDispatch } from '../../store/Store';
import Profile_Edit from './Profile_Edit';



// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants : Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const cardVariants : Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

const modalVariants : Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Profile_Page_Model: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: profile, isLoading, error } = useSelector(
    (state: any) => state.profile
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const navgate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile() as any);
  }, [dispatch]);

  // Get initials for avatar
  const getInitials = () => {
    const first = profile?.firstname?.[0] || '';
    const last = profile?.lastname?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get full name
  const getFullName = () => {
    return `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim() || 'User';
  };

  // Format address for display
  const getFormattedAddress = () => {
    const addr = profile?.address;
    if (!addr) return 'No address provided';
    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    return parts.join(', ') || 'No address provided';
  };

  // Calculate profile completeness (mock)
  const calculateCompleteness = () => {
    let filled = 0;
    let total = 6;
    if (profile?.firstname) filled++;
    if (profile?.lastname) filled++;
    if (profile?.email) filled++;
    if (profile?.mobile) filled++;
    if (profile?.address && Object.values(profile.address).some(v => v)) filled++;
    if (profile?.company?.companyName) filled++;
    return Math.round((filled / total) * 100);
  };

  const completeness = calculateCompleteness();

  // Loading skeleton with shimmer animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
                  <div className="h-6 w-40 bg-slate-200 rounded-lg mt-4 animate-pulse" />
                  <div className="h-4 w-32 bg-slate-200 rounded-lg mt-2 animate-pulse" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100 space-y-4">
                <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
                <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-200 rounded-lg animate-pulse mb-2" />
                        <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Profile</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <Reusable_Button
            text="Try Again"
            variant="primary"
            onClick={() => dispatch(fetchUserProfile() as any)}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-200/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-8">
           <div className='flex items-center gap-2 '>
             <ArrowLeft className='cursor-pointer'
             onClick={()=>navgate(-1)}
             size={30}/>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent"
            >
              My Profile
            </motion.h1>
           </div>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-2"
            >
              Manage your personal information and account settings
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2"
                  >
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl">
                        {profile?.profile || profile?.Profile ? (
                          <img
                            src={profile.profile || profile.Profile}
                            alt={getFullName()}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                              {getInitials()}
                            </span>
                          </div>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition"
                        onClick={() => setShowEditModal(true)}
                      >
                        <Edit3 size={14} className="text-indigo-600" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                <div className="pt-16 pb-6 px-6 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-slate-800"
                  >
                    {getFullName()}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-indigo-600 font-medium mt-1"
                  >
                    {profile?.company?.companyName ? 'Company Admin' : 'Member'}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-1"
                  >
                    <Mail size={14} />
                    {profile?.email}
                  </motion.p>
                </div>
              </motion.div>

              {/* Profile Completeness Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Award size={18} className="text-indigo-500" />
                    Profile Completeness
                  </h3>
                  <span className="text-2xl font-bold text-indigo-600">{completeness}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  {completeness === 100
                    ? 'Your profile is complete!'
                    : 'Complete your profile to get more features'}
                </p>
              </motion.div>

              {/* Company Info Card (if available) */}
              {profile?.company && (
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50"
                >
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Building size={18} className="text-indigo-500" />
                    Company Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Briefcase size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Company Name</p>
                        <p className="text-sm font-medium text-slate-700">
                          {profile.company.companyName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {profile.company.Admin?.address && (
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Admin Address</p>
                          <p className="text-sm text-slate-700">
                            {profile.company.Admin.address.street}, {profile.company.Admin.address.city}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User size={20} className="text-indigo-500" />
                    Personal Information
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2"
                  >
                    <Edit3 size={14} />
                    Edit
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <User size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">First Name</p>
                      <p className="text-slate-800 font-medium">{profile?.firstname || 'Not set'}</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <User size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Last Name</p>
                      <p className="text-slate-800 font-medium">{profile?.lastname || 'Not set'}</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Mail size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Email Address</p>
                      <p className="text-slate-800 font-medium">{profile?.email || 'Not set'}</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Phone size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-slate-800 font-medium">{profile?.mobile || 'Not set'}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Address Information Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50"
              >
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-indigo-500" />
                  Address Information
                </h3>
                <motion.div variants={itemVariants} className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Globe size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Full Address</p>
                    <p className="text-slate-800 font-medium">{getFormattedAddress()}</p>
                  </div>
                </motion.div>

                {profile?.address && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
                    {profile.address.street && (
                      <div>
                        <p className="text-xs text-slate-500">Street</p>
                        <p className="text-sm text-slate-700">{profile.address.street}</p>
                      </div>
                    )}
                    {profile.address.city && (
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="text-sm text-slate-700">{profile.address.city}</p>
                      </div>
                    )}
                    {profile.address.state && (
                      <div>
                        <p className="text-xs text-slate-500">State</p>
                        <p className="text-sm text-slate-700">{profile.address.state}</p>
                      </div>
                    )}
                    {profile.address.zipCode && (
                      <div>
                        <p className="text-xs text-slate-500">Zip Code</p>
                        <p className="text-sm text-slate-700">{profile.address.zipCode}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm p-6 border border-indigo-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Need to update your information?</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Keep your profile up to date for better communication
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <Edit3 size={18} />
                    Edit Profile
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal with Animation */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditModal(false);
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Profile_Edit
                data={profile || {}}
                onClose={() => setShowEditModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile_Page_Model;