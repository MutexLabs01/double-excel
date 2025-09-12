import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  X,
  Home,
  Folder,
  LayoutTemplate,
  Crown,
  Wand2,
  Settings,
  Info,
  CircleDollarSign,
  FileText,
} from "lucide-react"; // icon library

const sideBarLinks = [
  { icon: <Home size={20} />, label: "Home", id: 1, path: "/" },
  { icon: <Folder size={20} />, label: "Files", id: 2, path: "/files" },
  { icon: <LayoutTemplate size={20} />, label: "Templates", id: 3, path: "/templates" },
  { icon: <Crown size={20} />, label: "Premium", id: 4, path: "/premium" },
  { icon: <Wand2 size={20} />, label: "AI Tools", id: 5, path: "/tools" },
  { icon: <Info size={20} />, label: "About Us", id: 6, path: "/aboutus" },
  { icon: <CircleDollarSign size={20} />, label: "Pricing", id: 7, path: "/pricing" },
  { icon: <FileText size={20} />, label: "Documentation", id: 8, path: "/documentation" },
];

const Navbar: React.FC = () => {
  const [isClicked, setisClicked] = useState<boolean>(false);

  const handleClick = () => {
    setisClicked(!isClicked);
  };

  return (
    <div
      className={`h-screen bg-gray-800 flex flex-col py-4 shadow-md transition-all relative items-center ${
        !isClicked ? "w-20" : "w-[12vw]"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={handleClick}
        className={`bg-black text-white p-3 rounded-full hover:opacity-80 transition ${
          isClicked ? "absolute top-4 left-5" : "items-center"
        }`}
      >
        {!isClicked ? <Plus size={20} /> : <X size={20} />}
      </button>

      {/* Navigation Items */}
      <nav
        className={`flex flex-col space-y-6 mt-6 text-white ${
          isClicked ? "absolute top-[55px] left-8" : "text-center"
        }`}
      >
        {sideBarLinks.map((link) => (
          <Link
            to={link.path}
            key={link.id}
            className={`flex items-center text-white hover:text-blue-400 ${
              isClicked ? "justify-start" : "justify-center"
            }`}
          >
            <div>{link.icon}</div>
            {isClicked && <span className="ml-2">{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Settings + Profile */}
      <div className="flex flex-col items-center space-y-6 mt-auto text-white">
        <button className="flex items-center hover:text-blue-400">
          <Settings size={22} />
          {isClicked && <span className="ml-2">Settings</span>}
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
