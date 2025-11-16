import { useRecoilValueLoadable } from "recoil";
import { CoursesState } from "../Component/atoms/atoms";
import Coursecard from "../Component/coursecard";
import { useEffect, useState, useRef } from "react";

export default function Courses() {
  const coursesLoadable = useRecoilValueLoadable(CoursesState("all"));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coursesLoadable.state === "hasValue") {
      const allCourses = coursesLoadable.contents;
      
      // Filter courses based on search term
      const filteredCourses = allCourses.filter((course: any) =>
        (course.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (course.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (course.instructor?.username?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      );
      setCourses(filteredCourses);

      // Generate search suggestions
      if (searchTerm.length > 0) {
        const suggestionSet = new Set<string>();
        
        allCourses.forEach((course: any) => {
          // Add course names that match
          if (course.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestionSet.add(course.name);
          }
          // Add instructor names that match
          if (course.instructor?.username?.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestionSet.add(`Instructor: ${course.instructor.username}`);
          }
        });
        
        setSuggestions(Array.from(suggestionSet).slice(0, 5));
      } else {
        setSuggestions([]);
      }
    }
  }, [coursesLoadable, searchTerm]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        suggestionsRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.startsWith('Instructor: ') 
      ? suggestion.replace('Instructor: ', '') 
      : suggestion;
    setSearchTerm(cleanSuggestion);
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Search Bar */}
      <div className="fixed top-0 left-0 sm:left-13.5 right-0 z-10 bg-gray-100 shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Search Section */}
            <div className="w-96 mx-auto relative">
              <div className="relative">
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Search Input */}
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowSuggestions(suggestions.length > 0);
                  }}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-full text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isSearchFocused ? 'border-blue-300 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Search courses, instructors, topics..."
                />
                
                {/* Clear Button */}
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="ml-4 text-sm text-gray-600">
              {coursesLoadable.state === "hasValue" && (
                <span>{courses.length} course{courses.length !== 1 ? 's' : ''} found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-20 px-4 py-8">
        {/* Search Results Header */}
        {searchTerm && (
          <div className="max-w-7xl mx-auto mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Results for "{searchTerm}"
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{courses.length} result{courses.length !== 1 ? 's' : ''} found</span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading and Error States */}
        {coursesLoadable.state === "loading" ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : coursesLoadable.state === "hasError" ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m3 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading courses</h3>
            <p className="text-gray-500">Please try refreshing the page</p>
          </div>
        ) : (
          /* Course Grid */
          <div className="max-w-7xl mx-auto">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course: any) => (
                  <div key={course._id} className="transform hover:scale-105 transition-transform duration-200">
                    <Coursecard course={course} />
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              /* No Results State */
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search terms or browse all courses</p>
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View all courses
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
