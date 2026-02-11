import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { helpService } from "../services/helpService";
import { 
  ArrowLeft, Github, CheckCircle, Clock, 
  MessageSquare, User, Trophy, Code2, AlertTriangle 
} from "lucide-react";

const HelpDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solutionText, setSolutionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Load Data
  const fetchDetails = async () => {
    try {
      const data = await helpService.getDetails(requestId);
      setRequest(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  // 2. Handle "Post Solution" (For Solvers)
  const handlePostSolution = async (e) => {
    e.preventDefault();
    if (!solutionText.trim()) return;

    setSubmitting(true);
    try {
      await helpService.postSolution(requestId, solutionText);
      setSolutionText(""); // Clear form
      fetchDetails(); // Refresh to see new solution
      alert("Solution posted! The author will be notified.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post solution");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle "Accept Solution" (For Author)
  const handleAccept = async (solutionId) => {
    if (!window.confirm("Are you sure? This will mark the problem as Solved and give +10 Points to this user.")) return;

    try {
      await helpService.acceptSolution(solutionId);
      fetchDetails(); // Refresh to show "Solved" state
      alert("Solution Accepted! You can now post a new problem.");
    } catch (error) {
      alert("Failed to accept solution");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading discussion...</div>;
  if (!request) return <div className="p-10 text-center text-red-500">Problem not found.</div>;

  const isSolved = request.status === "solved";

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* =======================
              LEFT COLUMN: The Problem
             ======================= */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Problem Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {request.title}
                  </h1>
                  {isSolved ? (
                    <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> SOLVED
                    </span>
                  ) : (
                    <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                       OPEN
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {request.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Image (If exists) */}
                {request.image_url && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img 
                      src={request.image_url} 
                      alt="Problem Screenshot" 
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="prose prose-indigo max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
                  {request.description}
                </div>

                {/* GitHub Link */}
                {request.github_link && (
                  <a 
                    href={request.github_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Github className="w-4 h-4" /> View Code on GitHub
                  </a>
                )}
              </div>

              {/* Author Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <img 
                    src={request.author.profile_pic_url} 
                    alt={request.author.full_name} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{request.author.full_name}</p>
                    <p className="text-xs text-gray-500">Posted {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {request.is_owner && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        It's You!
                    </span>
                )}
              </div>
            </div>

            {/* SOLUTIONS LIST */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Solutions ({request.solutions.length})
              </h3>
              
              {request.solutions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No solutions yet. Be the first to help!</p>
                </div>
              ) : (
                request.solutions.map((sol) => (
                  <div 
                    key={sol.id} 
                    className={`bg-white rounded-2xl border p-5 transition-all ${
                        sol.is_accepted 
                        ? "border-green-500 shadow-md ring-1 ring-green-500" 
                        : "border-gray-200 shadow-sm"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <img src={sol.solver.profile_pic_url} className="w-8 h-8 rounded-full" />
                            <div>
                                <span className="text-sm font-bold text-gray-900 block">{sol.solver.full_name}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-amber-500" /> {sol.solver.reputation} RP
                                </span>
                            </div>
                        </div>
                        {sol.is_accepted && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> ACCEPTED
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="text-gray-700 text-sm whitespace-pre-wrap mb-4 pl-4 border-l-2 border-gray-100">
                        {sol.content}
                    </div>

                    {/* ACTIONS (Only for Author) */}
                    {request.is_owner && !isSolved && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={() => handleAccept(sol.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-sm rounded-lg transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" /> Accept Solution (+10 pts)
                            </button>
                        </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* =======================
              RIGHT COLUMN: Action
             ======================= */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                
                {/* STATUS CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Status</h3>
                    
                    {isSolved ? (
                         <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Problem Solved!</h4>
                            <p className="text-sm text-gray-500 mt-1">The author has accepted a solution.</p>
                         </div>
                    ) : (
                        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold">Waiting for solutions...</span>
                        </div>
                    )}
                </div>

                {/* POST SOLUTION FORM (Only if NOT owner & NOT solved) */}
                {!request.is_owner && !isSolved && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-indigo-600" /> Post a Solution
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Provide a clear explanation or code snippet. If accepted, you earn <b>+10 Reputation</b>.
                        </p>
                        
                        <form onSubmit={handlePostSolution}>
                            <textarea
                                required
                                rows="6"
                                placeholder="Hey! I think the issue is in line 4..."
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none mb-3"
                                value={solutionText}
                                onChange={(e) => setSolutionText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
                            >
                                {submitting ? "Posting..." : "Submit Solution"}
                            </button>
                        </form>
                    </div>
                )}

                 {/* OWNER TIP */}
                 {request.is_owner && !isSolved && (
                     <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex gap-3">
                         <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0" />
                         <p className="text-xs text-indigo-800">
                             <b>You are the author.</b> Review the solutions below and click <b>"Accept"</b> on the one that works. This will close the ticket and allow you to ask again.
                         </p>
                     </div>
                 )}

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpDetails;