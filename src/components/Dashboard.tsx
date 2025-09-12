import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Terminal from "./Terminal";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  Bars3Icon,
  ChevronDownIcon as DropIcon,
} from "@heroicons/react/24/solid";

interface DashboardProps {
  projects: { id: string; name: string; type?: string; owner?: string; lastModified?: string }[];
  currentProjectId: string | null;
  projectData: any;
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onShowModal: (
    type: "project" | "sheet" | "chart" | "rename" | "checkpoint",
    onSubmit: (name: string) => void
  ) => void;
  onExportFile?: (filename: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  currentProjectId,
  projectData,
  onCreateProject,
  onOpenProject,
  onShowModal,
  onExportFile,
}) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [layout, setLayout] = useState<"list" | "grid">("list");

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [peopleFilter, setPeopleFilter] = useState<string | null>(null);
  const [modifiedFilter, setModifiedFilter] = useState<string | null>(null);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedProjects = [...projects].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  // Apply filters
  const filteredProjects = sortedProjects.filter((proj) => {
    let typeOk = !typeFilter || proj.type === typeFilter;
    let peopleOk = !peopleFilter || proj.owner === peopleFilter;
    let modifiedOk = true;

    if (modifiedFilter && proj.lastModified) {
      const modifiedDate = new Date(proj.lastModified);
      const now = new Date();

      if (modifiedFilter === "Today") {
        modifiedOk = modifiedDate.toDateString() === now.toDateString();
      } else if (modifiedFilter === "Last 7 days") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        modifiedOk = modifiedDate >= weekAgo;
      } else if (modifiedFilter === "Last 30 days") {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        modifiedOk = modifiedDate >= monthAgo;
      }
    }

    return typeOk && peopleOk && modifiedOk;
  });

  return (
    <div className="flex h-screen text-white" style={{ backgroundColor: "#1B1C1D" }}>
      {/* Sidebar */}
      <Navbar onNewProjectClick={() => onShowModal("project", onCreateProject)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-6">
        <h1 className="text-4xl font-bold mb-6">Welcome User!</h1>

        <div className="flex flex-1 space-x-6">
          {/* Left: File System */}
          <div className="flex-1 flex flex-col">
            {/* Filters Row (Now ABOVE search bar) */}
            <div className="flex space-x-3 mb-4" ref={dropdownRef}>
              {/* Type Filter */}
              <div className="relative">
                <button
                  className="px-4 py-2 border rounded-full flex items-center space-x-2 bg-[#282A2C] text-gray-200 hover:bg-[#3281FD] hover:text-white"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "type" ? null : "type")
                  }
                >
                  <span>{typeFilter || "Type"}</span>
                  <DropIcon className="w-4 h-4" />
                </button>
                {openDropdown === "type" && (
                  <div className="absolute mt-2 w-48 bg-[#1B1C1D] border border-gray-600 rounded-md shadow-lg z-10">
                    {["Folder", "Chart", "Financial Model", "Spreadsheet"].map((t) => (
                      <div
                        key={t}
                        className="px-4 py-2 cursor-pointer hover:bg-[#3281FD]"
                        onClick={() => {
                          setTypeFilter(t);
                          setOpenDropdown(null);
                        }}
                      >
                        {t}
                      </div>
                    ))}
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-[#3281FD] text-gray-400"
                      onClick={() => {
                        setTypeFilter(null);
                        setOpenDropdown(null);
                      }}
                    >
                      Clear
                    </div>
                  </div>
                )}
              </div>

              {/* People Filter */}
              <div className="relative">
                <button
                  className="px-4 py-2 border rounded-full flex items-center space-x-2 bg-[#282A2C] text-gray-200 hover:bg-[#3281FD] hover:text-white"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "people" ? null : "people")
                  }
                >
                  <span>{peopleFilter || "People"}</span>
                  <DropIcon className="w-4 h-4" />
                </button>
                {openDropdown === "people" && (
                  <div className="absolute mt-2 w-48 bg-[#1B1C1D] border border-gray-600 rounded-md shadow-lg z-10">
                    {["Me", "Others"].map((p) => (
                      <div
                        key={p}
                        className="px-4 py-2 cursor-pointer hover:bg-[#3281FD]"
                        onClick={() => {
                          setPeopleFilter(p);
                          setOpenDropdown(null);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-[#3281FD] text-gray-400"
                      onClick={() => {
                        setPeopleFilter(null);
                        setOpenDropdown(null);
                      }}
                    >
                      Clear
                    </div>
                  </div>
                )}
              </div>

              {/* Modified Filter */}
              <div className="relative">
                <button
                  className="px-4 py-2 border rounded-full flex items-center space-x-2 bg-[#282A2C] text-gray-200 hover:bg-[#3281FD] hover:text-white"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "modified" ? null : "modified")
                  }
                >
                  <span>{modifiedFilter || "Modified"}</span>
                  <DropIcon className="w-4 h-4" />
                </button>
                {openDropdown === "modified" && (
                  <div className="absolute mt-2 w-48 bg-[#1B1C1D] border border-gray-600 rounded-md shadow-lg z-10">
                    {["Today", "Last 7 days", "Last 30 days", "Custom…"].map((m) => (
                      <div
                        key={m}
                        className="px-4 py-2 cursor-pointer hover:bg-[#3281FD]"
                        onClick={() => {
                          setModifiedFilter(m);
                          setOpenDropdown(null);
                        }}
                      >
                        {m}
                      </div>
                    ))}
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-[#3281FD] text-gray-400"
                      onClick={() => {
                        setModifiedFilter(null);
                        setOpenDropdown(null);
                      }}
                    >
                      Clear
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar (Now BELOW filters) */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search files..."
                className="w-full px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#282A2C",
                  border: "1px solid #3281FD",
                  caretColor: "#3281FD",
                }}
              />
            </div>

            {/* File Display */}
            <div className="flex-1 overflow-y-auto">
              {layout === "list" ? (
                // LIST VIEW
                <table className="min-w-full divide-y" style={{ borderColor: "#282A2C" }}>
                  <thead style={{ backgroundColor: "#282A2C" }}>
                    <tr className="text-left text-gray-300">
                      <th
                        className="px-4 py-2 font-medium flex items-center space-x-2 cursor-pointer"
                        onClick={() => setSortAsc(!sortAsc)}
                      >
                        <span>Name</span>
                        {sortAsc ? (
                          <ChevronUpIcon className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-blue-400" />
                        )}
                      </th>
                      <th className="px-4 py-2 font-medium">Last Modified</th>
                      <th className="px-4 py-2 font-medium">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((proj) => (
                      <tr
                        key={proj.id}
                        className="cursor-pointer"
                        style={{ backgroundColor: "#1B1C1D" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#346BF1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1B1C1D")
                        }
                        onClick={() => onOpenProject(proj.id)}
                      >
                        <td className="px-4 py-3 font-medium">{proj.name}</td>
                        <td className="px-4 py-3">{proj.lastModified || "Unknown"}</td>
                        <td className="px-4 py-3 font-medium">{proj.owner || "Me"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // GRID VIEW
                <div className="grid grid-cols-3 gap-4">
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-lg cursor-pointer text-center"
                      style={{ backgroundColor: "#282A2C" }}
                      onClick={() => onOpenProject(proj.id)}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        📄
                      </div>
                      <p className="font-medium">{proj.name}</p>
                      <p className="text-sm text-gray-400">
                        {proj.owner || "Me"} • {proj.lastModified || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="w-[30vw] max-w-3xl flex flex-col">
            {/* Layout Toggle ABOVE Terminal */}
            <div className="flex justify-end mb-4">
              <div className="flex rounded-full border border-gray-600 overflow-hidden">
                <button
                  onClick={() => setLayout("list")}
                  className={`px-4 py-2 flex items-center ${
                    layout === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-transparent text-gray-300"
                  }`}
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  className={`px-4 py-2 flex items-center ${
                    layout === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-transparent text-gray-300"
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <Terminal
              projects={projects}
              currentProjectId={currentProjectId}
              projectData={projectData}
              onOpenProject={onOpenProject}
              onExportFile={onExportFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
