import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
// --- CRITICAL FIX: Use 'api' instead of 'axios' ---
import api from "../api/axios"; 
import { Loader2 } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the 'q' parameter from the URL (e.g., /search?q=John)
  const query = searchParams.get("q");

  useEffect(() => {
    // If there's no query, don't search
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // --- CRITICAL FIX: Use 'api.get' ---
        // This automatically adds the "Authorization: Bearer <token>" header
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setResults([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); 

  // 1. Show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // 2. Show the results (or no results message)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-indigo-600">"{query}"</span>
      </h1>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profile_pic_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt={user.full_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.full_name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                     <span>{user.email}</span>
                     {user.location && (
                        <>
                            <span>•</span>
                            <span>{user.location}</span>
                        </>
                     )}
                  </div>
                  {/* Show friendship status if available */}
                  {user.is_friend && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        Friend
                      </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-xl text-gray-500">No results found for "{query}".</p>
          <p className="text-sm text-gray-400 mt-2">Try checking your spelling or searching for a different name.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;