import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts";
import ProfileSidebar from "../components/ProfileSidebar"; // 🟢 IMPORTED
import { useParams, Link } from "react-router-dom";
import AskHelpCard from "../components/AskHelpCard";
import api from "../api/axios";
import CreatableSelect from 'react-select/creatable';
import {
  FaCheck,
  FaPlus,
  FaComment,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { Mail, Phone, MapPin, X } from "lucide-react";

// --- OPTIONS & STYLES ---
const SKILL_OPTIONS = [
  { value: 'JavaScript', label: 'JavaScript' }, { value: 'Python', label: 'Python' }, { value: 'Java', label: 'Java' }, { value: 'C++', label: 'C++' }, { value: 'C#', label: 'C#' }, { value: 'TypeScript', label: 'TypeScript' }, { value: 'Go', label: 'Go' }, { value: 'Rust', label: 'Rust' }, { value: 'Swift', label: 'Swift' }, { value: 'Kotlin', label: 'Kotlin' }, { value: 'PHP', label: 'PHP' }, { value: 'Ruby', label: 'Ruby' }, { value: 'HTML/CSS', label: 'HTML/CSS' },
  { value: 'React.js', label: 'React.js' }, { value: 'Angular', label: 'Angular' }, { value: 'Vue.js', label: 'Vue.js' }, { value: 'Next.js', label: 'Next.js' }, { value: 'Tailwind CSS', label: 'Tailwind CSS' }, { value: 'Redux', label: 'Redux' }, { value: 'Bootstrap', label: 'Bootstrap' },
  { value: 'Node.js', label: 'Node.js' }, { value: 'Express.js', label: 'Express.js' }, { value: 'Django', label: 'Django' }, { value: 'Flask', label: 'Flask' }, { value: 'Spring Boot', label: 'Spring Boot' }, { value: 'SQL', label: 'SQL' }, { value: 'MySQL', label: 'MySQL' }, { value: 'PostgreSQL', label: 'PostgreSQL' }, { value: 'MongoDB', label: 'MongoDB' }, { value: 'Redis', label: 'Redis' }, { value: 'Firebase', label: 'Firebase' },
  { value: 'AWS', label: 'AWS' }, { value: 'Microsoft Azure', label: 'Microsoft Azure' }, { value: 'Google Cloud (GCP)', label: 'Google Cloud (GCP)' }, { value: 'Docker', label: 'Docker' }, { value: 'Kubernetes', label: 'Kubernetes' }, { value: 'Jenkins', label: 'Jenkins' }, { value: 'Git/GitHub', label: 'Git/GitHub' }, { value: 'Linux', label: 'Linux' }, { value: 'CI/CD', label: 'CI/CD' },
  { value: 'Machine Learning', label: 'Machine Learning' }, { value: 'Artificial Intelligence', label: 'Artificial Intelligence' }, { value: 'Data Science', label: 'Data Science' }, { value: 'Pandas', label: 'Pandas' }, { value: 'NumPy', label: 'NumPy' }, { value: 'TensorFlow', label: 'TensorFlow' }, { value: 'PyTorch', label: 'PyTorch' }, { value: 'NLP', label: 'NLP' }, { value: 'Computer Vision', label: 'Computer Vision' }, { value: 'Data Analysis', label: 'Data Analysis' }, { value: 'Power BI', label: 'Power BI' }, { value: 'Tableau', label: 'Tableau' },
  { value: 'React Native', label: 'React Native' }, { value: 'Flutter', label: 'Flutter' }, { value: 'Android Development', label: 'Android Development' }, { value: 'iOS Development', label: 'iOS Development' }, { value: 'UI/UX Design', label: 'UI/UX Design' }, { value: 'Figma', label: 'Figma' }, { value: 'Adobe XD', label: 'Adobe XD' }, { value: 'Cyber Security', label: 'Cyber Security' }, { value: 'Blockchain', label: 'Blockchain' }, { value: 'Web3', label: 'Web3' }, { value: 'Internet of Things (IoT)', label: 'Internet of Things (IoT)' }, { value: 'Robotics', label: 'Robotics' }, { value: 'Agile/Scrum', label: 'Agile/Scrum' }, { value: 'Project Management', label: 'Project Management' }
];

const LOCATION_OPTIONS = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Mumbai, Maharashtra', label: 'Mumbai, Maharashtra' }, { value: 'Delhi, NCR', label: 'Delhi, NCR' }, { value: 'Bangalore, Karnataka', label: 'Bangalore, Karnataka' }, { value: 'Hyderabad, Telangana', label: 'Hyderabad, Telangana' }, { value: 'Chennai, Tamil Nadu', label: 'Chennai, Tamil Nadu' }, { value: 'Kolkata, West Bengal', label: 'Kolkata, West Bengal' }, { value: 'Pune, Maharashtra', label: 'Pune, Maharashtra' }, { value: 'Ahmedabad, Gujarat', label: 'Ahmedabad, Gujarat' },
  { value: 'Gurgaon, Haryana', label: 'Gurgaon, Haryana' }, { value: 'Noida, Uttar Pradesh', label: 'Noida, Uttar Pradesh' }, { value: 'Jaipur, Rajasthan', label: 'Jaipur, Rajasthan' }, { value: 'Surat, Gujarat', label: 'Surat, Gujarat' }, { value: 'Lucknow, Uttar Pradesh', label: 'Lucknow, Uttar Pradesh' }, { value: 'Kanpur, Uttar Pradesh', label: 'Kanpur, Uttar Pradesh' }, { value: 'Nagpur, Maharashtra', label: 'Nagpur, Maharashtra' }, { value: 'Indore, Madhya Pradesh', label: 'Indore, Madhya Pradesh' }, { value: 'Thane, Maharashtra', label: 'Thane, Maharashtra' }, { value: 'Bhopal, Madhya Pradesh', label: 'Bhopal, Madhya Pradesh' }, { value: 'Visakhapatnam, Andhra Pradesh', label: 'Visakhapatnam, Andhra Pradesh' }, { value: 'Patna, Bihar', label: 'Patna, Bihar' }, { value: 'Vadodara, Gujarat', label: 'Vadodara, Gujarat' }, { value: 'Ghaziabad, Uttar Pradesh', label: 'Ghaziabad, Uttar Pradesh' }, { value: 'Ludhiana, Punjab', label: 'Ludhiana, Punjab' }, { value: 'Agra, Uttar Pradesh', label: 'Agra, Uttar Pradesh' }, { value: 'Nashik, Maharashtra', label: 'Nashik, Maharashtra' }, { value: 'Faridabad, Haryana', label: 'Faridabad, Haryana' }, { value: 'Meerut, Uttar Pradesh', label: 'Meerut, Uttar Pradesh' }, { value: 'Rajkot, Gujarat', label: 'Rajkot, Gujarat' }, { value: 'Varanasi, Uttar Pradesh', label: 'Varanasi, Uttar Pradesh' }, { value: 'Srinagar, J&K', label: 'Srinagar, J&K' }, { value: 'Aurangabad, Maharashtra', label: 'Aurangabad, Maharashtra' }, { value: 'Dhanbad, Jharkhand', label: 'Dhanbad, Jharkhand' }, { value: 'Amritsar, Punjab', label: 'Amritsar, Punjab' }, { value: 'Allahabad, Uttar Pradesh', label: 'Allahabad, Uttar Pradesh' }, { value: 'Ranchi, Jharkhand', label: 'Ranchi, Jharkhand' }, { value: 'Gwalior, Madhya Pradesh', label: 'Gwalior, Madhya Pradesh' }, { value: 'Coimbatore, Tamil Nadu', label: 'Coimbatore, Tamil Nadu' }, { value: 'Vijayawada, Andhra Pradesh', label: 'Vijayawada, Andhra Pradesh' }, { value: 'Jodhpur, Rajasthan', label: 'Jodhpur, Rajasthan' }, { value: 'Madurai, Tamil Nadu', label: 'Madurai, Tamil Nadu' }, { value: 'Raipur, Chhattisgarh', label: 'Raipur, Chhattisgarh' }, { value: 'Kota, Rajasthan', label: 'Kota, Rajasthan' }, { value: 'Guwahati, Assam', label: 'Guwahati, Assam' }, { value: 'Chandigarh', label: 'Chandigarh' }, { value: 'Mysore, Karnataka', label: 'Mysore, Karnataka' }, { value: 'Bhubaneswar, Odisha', label: 'Bhubaneswar, Odisha' }, { value: 'Thiruvananthapuram, Kerala', label: 'Thiruvananthapuram, Kerala' }, { value: 'Kochi, Kerala', label: 'Kochi, Kerala' }, { value: 'Dehradun, Uttarakhand', label: 'Dehradun, Uttarakhand' }, { value: 'Jamshedpur, Jharkhand', label: 'Jamshedpur, Jharkhand' }
];

const EDUCATION_OPTIONS = [
  { value: 'IIT Bombay', label: 'IIT Bombay' }, { value: 'IIT Delhi', label: 'IIT Delhi' }, { value: 'IIT Kanpur', label: 'IIT Kanpur' }, { value: 'IIT Madras', label: 'IIT Madras' }, { value: 'IIT Kharagpur', label: 'IIT Kharagpur' }, { value: 'IIT Roorkee', label: 'IIT Roorkee' }, { value: 'IIT Guwahati', label: 'IIT Guwahati' }, { value: 'IIT Hyderabad', label: 'IIT Hyderabad' },
  { value: 'NIT Trichy', label: 'NIT Trichy' }, { value: 'NIT Surathkal', label: 'NIT Surathkal' }, { value: 'NIT Warangal', label: 'NIT Warangal' }, { value: 'NIT Calicut', label: 'NIT Calicut' }, { value: 'NIT Rourkela', label: 'NIT Rourkela' }, { value: 'IIIT Hyderabad', label: 'IIIT Hyderabad' }, { value: 'IIIT Bangalore', label: 'IIIT Bangalore' }, { value: 'IIIT Allahabad', label: 'IIIT Allahabad' },
  { value: 'BITS Pilani', label: 'BITS Pilani' }, { value: 'VIT Vellore', label: 'VIT Vellore' }, { value: 'SRM Institute of Science and Technology', label: 'SRM Institute of Science and Technology' }, { value: 'Manipal Institute of Technology (MIT)', label: 'Manipal Institute of Technology (MIT)' }, { value: 'Thapar Institute of Engineering and Technology', label: 'Thapar Institute of Engineering and Technology' }, { value: 'Amity University', label: 'Amity University' }, { value: 'KIIT, Bhubaneswar', label: 'KIIT, Bhubaneswar' }, { value: 'Delhi University (DU)', label: 'Delhi University (DU)' }, { value: 'Mumbai University', label: 'Mumbai University' }, { value: 'Pune University (SPPU)', label: 'Pune University (SPPU)' }, { value: 'S.B. Patil College of Engineering, Pune', label: 'S.B. Patil College of Engineering, Pune' }, { value: 'Calcutta University', label: 'Calcutta University' }, { value: 'Jadavpur University', label: 'Jadavpur University' }, { value: 'Anna University', label: 'Anna University' }, { value: 'Osmania University', label: 'Osmania University' }, { value: 'IISc Bangalore', label: 'IISc Bangalore' }, { value: 'IISER Pune', label: 'IISER Pune' },
  { value: 'Self-Taught', label: 'Self-Taught' }, { value: 'Bootcamp Graduate', label: 'Bootcamp Graduate' }
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '0.75rem',
    padding: '0.2rem 0.3rem',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': { borderColor: '#6366f1' }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#eef2ff',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: '0.75rem',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#6366f1',
    ':hover': {
      backgroundColor: '#e0e7ff',
      color: '#3730a3',
    },
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

const Profile = () => {
  const { currentUser, refreshUser } = useAuth();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  
  const [tempAvatarFile, setTempAvatarFile] = useState(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  const [editForm, setEditForm] = useState({});

  const isCurrentUser = currentUser && String(currentUser.id) === String(userId);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/profile/${userId}`);
      setUser(res.data);
      setEditForm({
        full_name: res.data.full_name || '',
        location: res.data.location || '',
        description: res.data.description || '',
        skills: res.data.skills || '',
        email: res.data.email || '',
        mobile_no: res.data.mobile_no || '', 
        education: res.data.education || '',
        website: res.data.website || ''
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const sendFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/send/${user.id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to send request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/accept/${user.request_id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to accept request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/reject/${user.request_id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to reject request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitProfileUpdate = async (e) => {
    e?.preventDefault();
    const data = new FormData();
    
    Object.entries(editForm).forEach(([key, value]) => {
        data.append(key, value || ""); 
    });

    try {
      setProcessingAction(true);
      await api.patch('/api/profile/edit', data);
      await refreshUser(); 
      await fetchUserData(); 
      setIsBasicInfoModalOpen(false);
      setIsSkillsModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsEditingContact(false);
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempAvatarFile(file);
      setTempAvatarPreview(URL.createObjectURL(file));
      setIsAvatarRemoved(false);
    }
  };

  const handleAvatarRemovePreview = () => {
    setTempAvatarFile(null);
    setTempAvatarPreview(null);
    setIsAvatarRemoved(true);
  };

  const saveAvatarChanges = async () => {
    const data = new FormData();
    
    if (tempAvatarFile) {
      data.append('profile_pic', tempAvatarFile);
    } else if (isAvatarRemoved) {
      data.append('profile_pic', ''); 
      data.append('remove_profile_pic', 'true'); 
    } else {
      setIsAvatarModalOpen(false);
      return; 
    }

    Object.entries(editForm).forEach(([key, value]) => {
      data.append(key, value || ""); 
    });

    try {
      setProcessingAction(true);
      await api.patch('/api/profile/edit', data);
      await refreshUser();
      await fetchUserData();
      setIsAvatarModalOpen(false);
    } catch (err) {
      console.error("Avatar update error:", err);
      alert("Failed to update picture.");
    } finally {
      setProcessingAction(false);
    }
  };

  const renderFriendButton = () => {
    const base = "px-5 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 disabled:opacity-70 disabled:pointer-events-none";

    if (isCurrentUser) return null;

    if (user.is_friend) {
      return (
        <Link to={`/chat/${user.id}`} className={`${base} bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100`}>
          <FaComment /> Message
        </Link>
      );
    }

    if (user.request_sent) {
      return (
        <button className={`${base} bg-slate-50 text-slate-500 border border-slate-200 cursor-not-allowed`} disabled>
          <FiClock /> {processingAction ? "Processing..." : "Sent"}
        </button>
      );
    }

    if (user.request_received) {
      return (
        <div className="flex gap-2">
          <button onClick={acceptFriendRequest} disabled={processingAction} className={`${base} bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 px-4`}>
            {processingAction ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FaCheck /> Accept</>}
          </button>
          <button onClick={rejectFriendRequest} disabled={processingAction} className={`${base} bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-4`}>
            Reject
          </button>
        </div>
      );
    }

    return (
      <button onClick={sendFriendRequest} disabled={processingAction} className={`${base} bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-md`}>
        {processingAction ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FaPlus /> Connect</>}
      </button>
    );
  };

  // 🟢 SMART LOGIC FOR INITIALS
  const hasValidProfilePic = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.includes("default")) return false;
    return true;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const handleOpenAvatarModal = () => {
    if (isCurrentUser) {
      setTempAvatarFile(null);
      setTempAvatarPreview(user.profile_pic_url);
      setIsAvatarRemoved(false);
      setIsAvatarModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-slate-50 pt-0 pb-0 px-0 pr-4 lg:pr-6 overflow-y-auto md:overflow-hidden relative">
      
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="w-full max-w-[1400px] h-full ml-0">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 h-auto md:h-full items-start">
          
          {/* =======================
              🟢 MODULAR LEFT SIDEBAR 
             ======================= */}
          <ProfileSidebar 
            user={user}
            isCurrentUser={isCurrentUser}
            getInitials={getInitials}
            hasValidProfilePic={hasValidProfilePic}
            renderFriendButton={renderFriendButton}
            openAvatarModal={handleOpenAvatarModal}
            openBasicInfoModal={() => setIsBasicInfoModalOpen(true)}
            openContactModal={() => setIsContactModalOpen(true)}
            openSkillsModal={() => setIsSkillsModalOpen(true)}
            openDetailsModal={() => setIsDetailsModalOpen(true)}
          />

          {/* =======================
              RIGHT CONTENT (Feed & Posts)
             ======================= */}
          <div className="flex-1 w-full md:w-auto h-auto md:h-[calc(100vh-4rem)] md:overflow-y-auto no-scrollbar py-8 px-4 lg:px-8 max-w-4xl mx-auto">
             
             <div className="mb-8">
                <AskHelpCard user={user} isOwner={isCurrentUser} onRefresh={fetchUserData} />
             </div>
            
             <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isCurrentUser ? "Your Activity" : `Activity`}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {isCurrentUser 
                  ? "Share your thoughts, ideas, and updates with your network."
                  : `See what ${user.full_name} has been sharing lately.`
                }
              </p>
            </div>

            <div className="mb-10 space-y-6">
              <UserPosts userId={userId} isCurrentUser={isCurrentUser} />
            </div>
            
            {user.recent_interactions && user.recent_interactions.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Interactions</h3>
                <div className="space-y-3">
                  {user.recent_interactions.map((interaction, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                        {interaction.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{interaction.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{interaction.action}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{interaction.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🟢 MODALS PORTALS */}
      {/* ========================================================= */}

      {/* 1. Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Profile Picture</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="w-48 h-48 rounded-3xl border-4 border-slate-100 shadow-inner overflow-hidden mb-8 bg-indigo-50 flex items-center justify-center">
                {/* 🟢 SMART INITIALS CHECK */}
                {hasValidProfilePic(tempAvatarPreview) ? (
                  <img src={tempAvatarPreview} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl font-black text-indigo-300">{getInitials(user.full_name)}</span>
                )}
              </div>
              <div className="flex gap-3 w-full mb-4">
                <label className="flex-1 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-center cursor-pointer hover:bg-indigo-100 transition">
                  Change DP
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarFileSelect} disabled={processingAction}/>
                </label>
                <button onClick={handleAvatarRemovePreview} disabled={processingAction} className="flex-1 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-2">
                  <FaTrash className="text-sm"/> Remove
                </button>
              </div>
              <button onClick={saveAvatarChanges} disabled={processingAction || (!tempAvatarFile && !isAvatarRemoved)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Basic Info Modal */}
      {isBasicInfoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Basic Info</h3>
              <button onClick={() => setIsBasicInfoModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4 overflow-visible">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input type="text" name="full_name" value={editForm.full_name} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">About</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 h-28 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Write a short bio..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</label>
                <CreatableSelect
                  options={LOCATION_OPTIONS}
                  styles={customSelectStyles}
                  placeholder="Select or type your location..."
                  value={editForm.location ? { label: editForm.location, value: editForm.location } : null}
                  onChange={(selected) => setEditForm({ ...editForm, location: selected ? selected.value : '' })}
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed" 
                />
              </div>
              
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Skills Modal */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Skills</h3>
              <button onClick={() => setIsSkillsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4 overflow-visible">
              
              <div className="mb-24"> 
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Skills</label>
                <CreatableSelect
                  isMulti
                  options={SKILL_OPTIONS}
                  styles={customSelectStyles}
                  placeholder="Select or type to add skills..."
                  value={editForm.skills ? editForm.skills.split(',').filter(Boolean).map(s => ({ label: s.trim(), value: s.trim() })) : []}
                  onChange={(selected) => setEditForm({ ...editForm, skills: selected ? selected.map(s => s.value).join(', ') : '' })}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4 overflow-visible">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Education</label>
                <CreatableSelect
                  options={EDUCATION_OPTIONS}
                  styles={customSelectStyles}
                  placeholder="Select or type your institution..."
                  value={editForm.education ? { label: editForm.education, value: editForm.education } : null}
                  onChange={(selected) => setEditForm({ ...editForm, education: selected ? selected.value : '' })}
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Website URL</label>
                <input type="url" name="website" value={editForm.website} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="https://yourwebsite.com" />
              </div>
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Contact Info Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{isEditingContact ? "Edit Contact Info" : `${user.full_name}'s Contact Info`}</h3>
              <button 
                onClick={() => { setIsContactModalOpen(false); setIsEditingContact(false); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20}/>
              </button>
            </div>
            
            {isEditingContact ? (
              <form onSubmit={(e) => { submitProfileUpdate(e).then(() => setIsEditingContact(false)); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" name="email" value={editForm.email} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed outline-none" title="Email cannot be changed here" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile Number</label>
                  <input type="text" name="mobile_no" value={editForm.mobile_no} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                  <button type="submit" disabled={processingAction} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                    {processingAction ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Mail size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  </div>
                </div>
                {user.mobile_no && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Phone size={20}/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.mobile_no}</p>
                      <p className="text-xs text-slate-500 font-medium">Mobile Number</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><MapPin size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.location || "Remote"}</p>
                    <p className="text-xs text-slate-500 font-medium">Location</p>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <button 
                    onClick={() => setIsEditingContact(true)} 
                    className="w-full py-3 mt-4 border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit Contact Info
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;