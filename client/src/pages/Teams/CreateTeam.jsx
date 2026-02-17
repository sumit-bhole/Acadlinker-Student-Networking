import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teamApi";
import { 
  Users, 
  Lock, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Loader2,
  PlusCircle,
  Briefcase,
  FileText,
  Sparkles,
  X
} from "lucide-react";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public",
    is_hiring: false,
    hiring_requirements: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation
  const validateField = (name, value) => {
    switch(name) {
      case 'name':
        if (!value.trim()) return "Team name is required";
        if (value.length < 3) return "Team name must be at least 3 characters";
        if (value.length > 50) return "Team name must be less than 50 characters";
        return "";
      case 'description':
        if (value.length > 500) return "Description must be less than 500 characters";
        return "";
      case 'hiring_requirements':
        if (formData.is_hiring && !value.trim()) return "Please specify hiring requirements";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field) => {
    setTouched({...touched, [field]: true});
    const error = validateField(field, formData[field]);
    setErrors({...errors, [field]: error});
  };

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors({...errors, [field]: error});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, field) => ({...acc, [field]: true}), {}));
      return;
    }

    setLoading(true);
    try {
      const response = await createTeam(formData);
      // You could add a success toast notification here
      navigate("/teams/my");
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.error || "Failed to create team. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid (for enabling/disabling submit button)
  const isFormValid = () => {
    if (!formData.name.trim() || formData.name.length < 3) return false;
    if (formData.is_hiring && !formData.hiring_requirements.trim()) return false;
    return Object.keys(errors).filter(key => key !== 'submit').every(key => !errors[key]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Create Your Team
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Build your dream team and start collaborating on amazing projects together
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Team Name Field */}
            <div className="space-y-2 animate-slideUp" style={{animationDelay: '0.1s'}}>
              <label className="block text-sm font-semibold text-slate-700">
                Team Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className={`h-5 w-5 transition-colors duration-200 ${
                    errors.name && touched.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'
                  }`} />
                </div>
                <input
                  required
                  type="text"
                  className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-200 ${
                    errors.name && touched.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 hover:bg-white'
                  }`}
                  placeholder="e.g. Alpha Hackers, Design Masters"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  disabled={loading}
                />
                {touched.name && !errors.name && formData.name.length >= 3 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 animate-scaleIn" />
                  </div>
                )}
              </div>
              {errors.name && touched.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Choose a unique and memorable name for your team (3-50 characters)
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2 animate-slideUp" style={{animationDelay: '0.2s'}}>
              <label className="block text-sm font-semibold text-slate-700">
                Team Description
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className={`h-5 w-5 transition-colors duration-200 ${
                    errors.description && touched.description ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'
                  }`} />
                </div>
                <textarea
                  rows="4"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-200 resize-none ${
                    errors.description && touched.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 hover:bg-white'
                  }`}
                  placeholder="Describe your team's mission, goals, and what kind of projects you work on..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Help others understand what your team is about
                </span>
                <span className={`font-medium ${
                  formData.description.length > 450 ? 'text-orange-600' : 'text-slate-500'
                }`}>
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Privacy Selection */}
            <div className="space-y-3 animate-slideUp" style={{animationDelay: '0.3s'}}>
              <label className="block text-sm font-semibold text-slate-700">
                Team Privacy <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Public Option */}
                <button
                  type="button"
                  onClick={() => handleChange('privacy', 'public')}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-lg ${
                    formData.privacy === 'public'
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100/50 shadow-indigo-200'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-white'
                  }`}
                  disabled={loading}
                >
                  {formData.privacy === 'public' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-indigo-600 animate-scaleIn" />
                    </div>
                  )}
                  <Globe size={24} className={`mb-3 transition-colors duration-300 ${
                    formData.privacy === 'public' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                  }`} />
                  <h3 className="font-bold text-lg mb-1">Public Team</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Anyone can discover your team and request to join.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Discoverable</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Open requests</span>
                  </div>
                </button>

                {/* Private Option */}
                <button
                  type="button"
                  onClick={() => handleChange('privacy', 'private')}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-lg ${
                    formData.privacy === 'private'
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100/50 shadow-indigo-200'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-white'
                  }`}
                  disabled={loading}
                >
                  {formData.privacy === 'private' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-indigo-600 animate-scaleIn" />
                    </div>
                  )}
                  <Lock size={24} className={`mb-3 transition-colors duration-300 ${
                    formData.privacy === 'private' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                  }`} />
                  <h3 className="font-bold text-lg mb-1">Private Team</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Only visible to invited members.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Invite only</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Private</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Hiring Toggle */}
            <div className="space-y-3 animate-slideUp" style={{animationDelay: '0.4s'}}>
              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                formData.is_hiring 
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="hiring"
                      checked={formData.is_hiring}
                      onChange={(e) => handleChange('is_hiring', e.target.checked)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('is_hiring', !formData.is_hiring)}
                      className={`w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-200 ${
                        formData.is_hiring ? 'bg-green-600' : 'bg-slate-300'
                      }`}
                      disabled={loading}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        formData.is_hiring ? 'translate-x-8' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="hiring" className="block font-semibold text-slate-800 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        Currently recruiting new members
                      </span>
                    </label>
                    <p className="text-sm text-slate-600 mt-1">
                      Let potential members know you're actively looking for talent
                    </p>
                  </div>
                </div>
              </div>

              {/* Hiring Requirements - Animated Expand */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                formData.is_hiring ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What are you looking for? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sparkles className={`h-5 w-5 transition-colors duration-200 ${
                        errors.hiring_requirements && touched.hiring_requirements ? 'text-red-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <input
                      type="text"
                      className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-200 ${
                        errors.hiring_requirements && touched.hiring_requirements 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 hover:bg-white'
                      }`}
                      placeholder="e.g. Looking for React developers with UI/UX skills..."
                      value={formData.hiring_requirements}
                      onChange={(e) => handleChange('hiring_requirements', e.target.value)}
                      onBlur={() => handleBlur('hiring_requirements')}
                      disabled={loading || !formData.is_hiring}
                    />
                  </div>
                  {errors.hiring_requirements && touched.hiring_requirements && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1 animate-shake">
                      <AlertCircle className="h-4 w-4" />
                      {errors.hiring_requirements}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 animate-slideUp" style={{animationDelay: '0.5s'}}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3.5 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:ring-4 focus:ring-slate-200 outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    Create Team
                  </>
                )}
              </button>
            </div>

            {/* Form Summary - Shows what will be created */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-slideUp" style={{animationDelay: '0.6s'}}>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
                Team Summary
              </h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="font-medium">Name:</span> {formData.name || "(not set)"}</p>
                <p><span className="font-medium">Privacy:</span> {formData.privacy === 'public' ? '🌍 Public' : '🔒 Private'}</p>
                <p><span className="font-medium">Recruiting:</span> {formData.is_hiring ? '✅ Yes' : '❌ No'}</p>
                {formData.is_hiring && (
                  <p><span className="font-medium">Requirements:</span> {formData.hiring_requirements || "(not specified)"}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            Tips for creating a great team
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Choose a clear, descriptive team name (3-50 chars)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Write a detailed description of your goals
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Choose privacy setting based on your needs
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Specify skills you're looking for when hiring
            </li>
          </ul>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          opacity: 0;
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CreateTeam;