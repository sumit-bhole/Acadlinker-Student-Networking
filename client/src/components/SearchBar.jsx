import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to the search page with the query
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // Clear the search bar after submit
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex-1 px-4 lg:px-12">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Acadlinker..."
          className="w-full h-10 px-4 pr-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="absolute top-0 right-0 h-full px-3 flex items-center text-gray-400 hover:text-white"
          aria-label="Submit search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;