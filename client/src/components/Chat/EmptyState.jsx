import React from "react";
import { MessageSquare } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-4">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
        <MessageSquare className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-200" />
      </div>
      <p className="text-sm font-medium text-center">Select a friend to start chatting</p>
      <p className="text-xs text-slate-300 mt-2 text-center max-w-xs">
        Your conversations will appear here once you select a contact
      </p>
    </div>
  );
};

export default EmptyState;