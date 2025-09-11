import React from "react";
import {
  Plus,
  Home,
  Folder,
  LayoutTemplate,
  Crown,
  Wand2,
  Settings,
} from "lucide-react"; // icon library

const Navbar: React.FC = () => {
  return (
    <div className="h-screen w-20 bg-gray-100 flex flex-col items-center py-4 shadow-md">
      {/* Create Button */}
      <button className="bg-black text-white p-3 rounded-full hover:opacity-80 transition">
        <Plus size={20} />
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-6 mt-6 text-black">
        <button className="flex justify-center">
          <Home size={22} />
        </button>
        <button className="flex justify-center">
          <Folder size={22} />
        </button>
        <button className="flex justify-center">
          <LayoutTemplate size={22} />
        </button>
        <button className="flex justify-center">
          <Crown size={22} />
        </button>
        <button className="flex justify-center">
          <Wand2 size={22} />
        </button>
      </nav>

      {/* Bottom Settings + Profile */}
      <div className="flex flex-col items-center space-y-6 mt-auto text-black">
        <button>
          <Settings size={22} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

