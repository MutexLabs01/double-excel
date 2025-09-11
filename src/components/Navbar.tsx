import React, { useState } from "react";
import {
  Plus,
  X,
  Home,
  Folder,
  LayoutTemplate,
  Crown,
  Wand2,
  Settings,
} from "lucide-react"; // icon library

const sideBarLinks = [
  {
    icon: <Home size={20} />,
    label: "Home",
    id: 1,
  },
  {
    icon: <Folder size={20} />,
    label: "Files",
    id: 2,
  },
  {
    icon: <LayoutTemplate size={20} />,
    label: "Templates",
    id: 3,
  },
  {
    icon: <Crown size={20} />,
    label: "Premium",
    id: 4,
  },
  {
    icon: <Wand2 size={20} />,
    label: "AI Tools",
    id: 5,
  },
];

const Navbar: React.FC = () => {
  const [isClicked, setisClicked] = useState<boolean>(false);

  const handleClick = () => {
    setisClicked(!isClicked);
  };

  return (
    <div
      className={`h-screen bg-gray-100 flex flex-col py-4 shadow-md transition-all relative items-center ${
        !isClicked ? "w-20" : "w-[20vw]"
      }`}
    >
      {/* Create Button */}
      <button
        onClick={handleClick}
        className={`bg-black text-white p-3 rounded-full hover:opacity-80 transition ${isClicked ? "absolute top-4 right-4" : "items-center"}`}
      >
        {!isClicked ? <Plus size={20} /> : <X size={20} />}
      </button>

      {/* Navigation Items */}
      <nav className={`flex flex-col space-y-6 mt-6 text-black ${isClicked ? "absolute top-[55px] left-8" : "text-center"}`}>
        {sideBarLinks.map((link) => (
          <button className={`${isClicked ? 'text-left' : 'text-center'}`} key={link.id}>
            {link.icon}
            {isClicked && <span className="ml-2">{link.label}</span>}
          </button>
        ))}
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
