import React, { useState } from "react";
import {
  Plus,
  Cross,
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
    id: 1
  },
  {
    icon: <Folder size={20} />,
    label: "Files",
    id: 2
  },
  {
    icon: <LayoutTemplate size={20} />,
    label: "Templates",
    id: 3
  },
  {
    icon: <Crown size={20} />,
    label: "Premium",
    id: 4
  },
  {
    icon: <Wand2 size={20} />,
    label: "AI Tools",
    id: 5
  }
]

const Navbar: React.FC = () => {

  const [isClicked, setisClicked] = useState<boolean>(false);
  
  const handleClick = () => {
    setisClicked(!isClicked);
  };

  return (
    <div className={`h-screen bg-gray-100 flex flex-col items-center py-4 shadow-md ${!isClicked ? 'w-20':'w-[20vw]'}`}>
      {/* Create Button */}
      <button onClick={handleClick} className="bg-black text-white p-3 rounded-full hover:opacity-80 transition">
        {
          !isClicked ? <Plus size={20} /> : <Cross size={20} />
        }
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-6 mt-6 text-black">
        {sideBarLinks.map((link) => (
          <button className="flex justify-center" key={link.id}>
          <Home size={22} />
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

