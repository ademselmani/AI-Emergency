import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Settings, User, LogOut, CircleUser } from "lucide-react";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");
        const response = await axios.get(
          `http://localhost:3000/employee/finduser/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const getRoleBadge = (role) => {
    const roleConfig = {
      nurse: { label: "Nurse", emoji: "🏥", color: "bg-blue-100 text-blue-800" },
      admin: { label: "Admin", emoji: "🔧", color: "bg-gray-100 text-gray-800" },
      doctor: { label: "Doctor", emoji: "🩺", color: "bg-green-100 text-green-800" },
      receptionnist: { label: "Receptionist", emoji: "👨💻", color: "bg-purple-100 text-purple-800" },
      triage_nurse: { label: "Triage Nurse", emoji: "👩⚕️", color: "bg-pink-100 text-pink-800" }
    };
    
    const { label, emoji, color } = roleConfig[role] || { 
      label: "Unknown", emoji: "❓", color: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`${color} px-2.5 py-1 rounded-full text-sm font-medium flex items-center gap-1.5`}>
        <span>{emoji}</span>
        {label}
      </span>
    );
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Section - Search */}
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
                
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                {currentUser?.image ? (
                  <img
                    src={currentUser.image}
                    alt="User Avatar"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ) : (
                  <CircleUser className="h-9 w-9 text-gray-400" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="flex items-center gap-3 p-3">
                    {currentUser?.image ? (
                      <img
                        src={currentUser.image}
                        alt="User Avatar"
                        className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                      />
                    ) : (
                      <CircleUser className="h-12 w-12 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {currentUser?.name || "Anonymous User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentUser ? getRoleBadge(currentUser.role) : "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div className="divider my-1" />

                  <div className="space-y-1">
                    <a
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </a>
                  </div>

                  <div className="divider my-1" />

                  <a
                    href="/login"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 bg-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </nav>
  );
}

export default Navbar;