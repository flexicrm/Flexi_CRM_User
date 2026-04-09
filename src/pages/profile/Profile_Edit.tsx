// // components/Profile_Edit.tsx
// import { motion } from 'framer-motion';
// import { Camera, X } from 'lucide-react';
// import React, { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Reusable_Button from '../../component/button/Reusable_Button';
// import { updateUserProfile, type UserData } from '../../store/homepage_slice/Profile_Slice';

// interface ProfileEditProps {
//   data: UserData;
//   onClose: () => void;
// }

// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05 },
//   },
// };

// const Profile_Edit: React.FC<ProfileEditProps> = ({ data, onClose }) => {
//   const dispatch = useDispatch();
//   const { isLoading } = useSelector((state: any) => state.profile);
//   const [formData, setFormData] = useState<UserData>(data);
//   const [profileImage, setProfileImage] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(data?.profile || data?.Profile || null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     setFormData(data);
//     setImagePreview(data?.profile || data?.Profile || null);
//   }, [data]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         [name]: value,
//       },
//     }));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setProfileImage(file);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     formDataToSend.append('firstname', formData.firstname || '');
//     formDataToSend.append('lastname', formData.lastname || '');
//     formDataToSend.append('email', formData.email || '');
//     formDataToSend.append('mobile', formData.mobile || '');

//     // Append profile image if selected
//     if (profileImage) {
//       formDataToSend.append('profile', profileImage);
//     }

//     if (formData.address) {
//       const addr = formData.address;
//       formDataToSend.append('address[street]', addr.street || '');
//       formDataToSend.append('address[city]', addr.city || '');
//       formDataToSend.append('address[state]', addr.state || '');
//       formDataToSend.append('address[zipCode]', addr.zipCode || '');
//       formDataToSend.append('address[country]', addr.country || '');
//     }

//     if (formData.company) {
//       formDataToSend.append('company[companyName]', formData.company.companyName || '');
//     }

//     const resultAction = await dispatch(updateUserProfile(formDataToSend));
//     if (updateUserProfile.fulfilled.match(resultAction)) {
//       // Cleanup preview URL
//       if (imagePreview && imagePreview.startsWith('blob:')) {
//         URL.revokeObjectURL(imagePreview);
//       }
//       onClose();
//     }
//   };

//   // Cleanup preview URL on unmount
//   useEffect(() => {
//     return () => {
//       if (imagePreview && imagePreview.startsWith('blob:')) {
//         URL.revokeObjectURL(imagePreview);
//       }
//     };
//   }, [imagePreview]);

//   // Get initials for avatar
//   const getInitials = () => {
//     const first = formData?.firstname?.[0] || '';
//     const last = formData?.lastname?.[0] || '';
//     return (first + last).toUpperCase() || 'U';
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.95 }}
//       transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//       className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
//     >
//       {/* Header */}
//       <motion.div
//         initial={{ x: -20, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white"
//       >
//         <motion.h3 
//           initial={{ x: -10, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ delay: 0.1 }}
//           className="text-lg font-bold text-slate-800"
//         >
//           Edit Profile
//         </motion.h3>
//         <motion.button
//           whileHover={{ scale: 1.1, rotate: 90 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={onClose}
//           className="p-1 rounded-full hover:bg-slate-100 transition"
//           disabled={isLoading}
//         >
//           <X size={18} className="text-slate-500" />
//         </motion.button>
//       </motion.div>

//       <form onSubmit={handleSubmit}>
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           animate="visible"
//           className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
//         >
//           {/* Profile Image Upload Section */}
//           <motion.div variants={fadeInUp} className="flex justify-center mb-4">
//             <div className="relative group">
//               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt="Profile preview"
//                     className="w-full h-full rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//                     <span className="text-3xl font-bold text-white">
//                       {getInitials()}
//                     </span>
//                   </div>
//                 )}
//               </div>
//               <motion.label
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 htmlFor="profile-image"
//                 className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition"
//               >
//                 <Camera size={16} className="text-indigo-600" />
//               </motion.label>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 id="profile-image"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="hidden"
//               />
//             </div>
//           </motion.div>

//           {/* Personal Information Fields */}
//           <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <motion.div variants={fadeInUp}>
//               <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 transition={{ type: 'spring', stiffness: 400 }}
//                 type="text"
//                 name="firstname"
//                 value={formData.firstname || ''}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//               />
//             </motion.div>
            
//             <motion.div variants={fadeInUp}>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 transition={{ type: 'spring', stiffness: 400 }}
//                 type="text"
//                 name="lastname"
//                 value={formData.lastname || ''}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//               />
//             </motion.div>
            
//             <motion.div variants={fadeInUp}>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email || ''}
//                 disabled
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
//               />
//             </motion.div>
            
//             <motion.div variants={fadeInUp}>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
//               <motion.input
//                 whileFocus={{ scale: 1.01 }}
//                 transition={{ type: 'spring', stiffness: 400 }}
//                 type="tel"
//                 name="mobile"
//                 value={formData.mobile || ''}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//               />
//             </motion.div>
//           </motion.div>

//           {/* Address Section */}
//           <motion.div variants={fadeInUp} className="border-t border-slate-100 pt-4 mt-2">
//             <motion.h4 
//               initial={{ x: -10, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               className="font-medium text-slate-800 mb-3"
//             >
//               Address
//             </motion.h4>
            
//             <div className="space-y-3">
//               <motion.input
//                 variants={fadeInUp}
//                 whileFocus={{ scale: 1.01 }}
//                 type="text"
//                 name="street"
//                 placeholder="Street"
//                 value={formData.address?.street || ''}
//                 onChange={handleAddressChange}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//               />
              
//               <div className="grid grid-cols-2 gap-3">
//                 <motion.input
//                   variants={fadeInUp}
//                   whileFocus={{ scale: 1.01 }}
//                   type="text"
//                   name="city"
//                   placeholder="City"
//                   value={formData.address?.city || ''}
//                   onChange={handleAddressChange}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                 />
//                 <motion.input
//                   variants={fadeInUp}
//                   whileFocus={{ scale: 1.01 }}
//                   type="text"
//                   name="state"
//                   placeholder="State"
//                   value={formData.address?.state || ''}
//                   onChange={handleAddressChange}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                 />
//               </div>
              
//               <div className="grid grid-cols-2 gap-3">
//                 <motion.input
//                   variants={fadeInUp}
//                   whileFocus={{ scale: 1.01 }}
//                   type="text"
//                   name="zipCode"
//                   placeholder="Zip Code"
//                   value={formData.address?.zipCode || ''}
//                   onChange={handleAddressChange}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                 />
//                 <motion.input
//                   variants={fadeInUp}
//                   whileFocus={{ scale: 1.01 }}
//                   type="text"
//                   name="country"
//                   placeholder="Country"
//                   value={formData.address?.country || ''}
//                   onChange={handleAddressChange}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
//                 />
//               </div>
//             </div>
//           </motion.div>

//           {/* Action Buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="flex justify-end gap-3 pt-4 border-t border-slate-100"
//           >
//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <Reusable_Button
//                 type="button"
//                 variant="secondary"
//                 onClick={onClose}
//                 disabled={isLoading}
//                 text="Cancel"
//               />
//             </motion.div>
//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <Reusable_Button
//                 type="submit"
//                 variant="primary"
//                 disabled={isLoading}
//                 text={isLoading ? 'Saving...' : 'Save Changes'}
//                 isLoading={isLoading}
//               />
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       </form>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #c7d2fe;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #818cf8;
//         }
//       `}</style>
//     </motion.div>
//   );
// };

// export default Profile_Edit;


// components/Profile_Edit.tsx
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Reusable_Button from '../../component/button/Reusable_Button';
import { updateUserProfile, type UserData } from '../../store/homepage_slice/Profile_Slice';

interface ProfileEditProps {
  data: UserData;
  onClose: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const Profile_Edit: React.FC<ProfileEditProps> = ({ data, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: any) => state.profile);
  const [formData, setFormData] = useState<UserData>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('firstname', formData.firstname || '');
    formDataToSend.append('lastname', formData.lastname || '');
    formDataToSend.append('email', formData.email || '');
    formDataToSend.append('mobile', formData.mobile || '');

    if (formData.address) {
      const addr = formData.address;
      formDataToSend.append('address[street]', addr.street || '');
      formDataToSend.append('address[city]', addr.city || '');
      formDataToSend.append('address[state]', addr.state || '');
      formDataToSend.append('address[zipCode]', addr.zipCode || '');
      formDataToSend.append('address[country]', addr.country || '');
    }

    if (formData.company) {
      formDataToSend.append('company[companyName]', formData.company.companyName || '');
    }

    const resultAction = await dispatch(updateUserProfile(formDataToSend));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white"
      >
        <motion.h3 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-slate-800"
        >
          Edit Profile
        </motion.h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100 transition"
          disabled={isLoading}
        >
          <X size={18} className="text-slate-500" />
        </motion.button>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="p-6 space-y-4"
        >
          {/* Personal Information Fields */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400 }}
                type="text"
                name="firstname"
                value={formData.firstname || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400 }}
                type="text"
                name="lastname"
                value={formData.lastname || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400 }}
                type="tel"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </motion.div>
          </motion.div>

          {/* Address Section */}
          <motion.div variants={fadeInUp} className="border-t border-slate-100 pt-4 mt-2">
            <motion.h4 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="font-medium text-slate-800 mb-3"
            >
              Address
            </motion.h4>
            
            <div className="space-y-3">
              <motion.input
                variants={fadeInUp}
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="street"
                placeholder="Street"
                value={formData.address?.street || ''}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <motion.input
                  variants={fadeInUp}
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.address?.city || ''}
                  onChange={handleAddressChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <motion.input
                  variants={fadeInUp}
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.address?.state || ''}
                  onChange={handleAddressChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <motion.input
                  variants={fadeInUp}
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={formData.address?.zipCode || ''}
                  onChange={handleAddressChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <motion.input
                  variants={fadeInUp}
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.address?.country || ''}
                  onChange={handleAddressChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-3 pt-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Reusable_Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                text="Cancel"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Reusable_Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                text={isLoading ? 'Saving...' : 'Save Changes'}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Profile_Edit;