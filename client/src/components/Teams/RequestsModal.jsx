import React from "react";
import { X, Check, Clock, XCircle, UserPlus, ArrowRight } from "lucide-react";
import { respondToInvite } from "../../api/teamApi";

const RequestsModal = ({ isOpen, onClose, invites, requests, onRefresh }) => {
  if (!isOpen) return null;

  const handleResponse = async (inviteId, action) => {
    try {
      await respondToInvite({ invite_id: inviteId, action });
      onRefresh(); // Reload data to remove the item
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" /> Activity Center
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/50 h-full">
          
          {/* 1. INVITES RECEIVED */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">
              Invites Received ({invites.length})
            </h4>
            {invites.length === 0 ? (
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-sm text-slate-400 italic">
                No pending invites.
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map((inv) => (
                  <div key={inv.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-800 font-medium">
                        <span className="font-bold text-indigo-700">{inv.sender_name}</span> invited you to join <span className="font-bold text-indigo-700">{inv.team_name}</span>
                      </p>
                      {inv.message && <p className="text-xs text-slate-500 mt-1 italic">"{inv.message}"</p>}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleResponse(inv.id, 'reject')}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleResponse(inv.id, 'accept')}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. REQUESTS SENT */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">
              Requests Sent ({requests.length})
            </h4>
            {requests.length === 0 ? (
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-sm text-slate-400 italic">
                You haven't sent any requests.
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div key={req.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      Request to join <b>{req.team_name}</b>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1
                      ${req.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {req.status === 'pending' && <Clock size={10} />}
                      {req.status === 'accepted' && <Check size={10} />}
                      {req.status === 'rejected' && <XCircle size={10} />}
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default RequestsModal;