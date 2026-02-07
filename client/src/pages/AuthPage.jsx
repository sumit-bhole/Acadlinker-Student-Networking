import React, { useState } from 'react';
import { Users, BookOpen, Shield } from 'lucide-react';
import LoginForm from '../components/LoginForm';     
import RegisterForm from '../components/RegisterForm'; 

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
    <div className="p-2.5 bg-indigo-500/20 rounded-xl">
      <Icon className="h-6 w-6 text-indigo-300" />
    </div>
    <div>
      <h3 className="font-semibold text-white text-lg tracking-wide">{title}</h3>
      <p className="text-indigo-100/70 text-sm leading-relaxed mt-1">{desc}</p>
    </div>
  </div>
);

const AuthPage = () => {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50">
      
      {/* LEFT SECTION – BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex relative flex-col justify-center px-16 bg-[#0f172a] overflow-hidden">
        
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-10">
             <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                <Shield className="h-6 w-6 text-white" />
             </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
              AcadLinker
            </h1>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200">
             Master your skills through <br /> collaboration.
          </h2>
          
          <p className="text-lg text-indigo-200/60 mb-12 leading-relaxed">
            The professional network for students to find partners, build projects, and showcase their academic portfolio.
          </p>

          <div className="space-y-4">
            <FeatureCard 
              icon={Users} 
              title="Smart Matching" 
              desc="Our algorithm connects you with peers who complement your skill set."
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Project Workspace" 
              desc="Manage tasks, share resources, and track progress in one place."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION – AUTH FORMS */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-10">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-3 shadow-md">
               <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              AcadLinker
            </h1>
          </div>

          {/* Form Container */}
          <div className="bg-white"> 
            {view === 'login' ? (
              <LoginForm onSwitchView={() => setView('register')} />
            ) : (
              <RegisterForm onSwitchView={() => setView('login')} />
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 text-center">
             <p className="text-xs text-gray-400">
                &copy; 2026 AcadLinker Inc. <br/>
                <a href="#" className="hover:underline">Privacy</a> &bull; <a href="#" className="hover:underline">Terms</a>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;