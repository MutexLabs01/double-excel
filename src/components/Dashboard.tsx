import React, { useState } from "react";
import Navbar from "./Navbar";
import Terminal from "./Terminal";

interface DashboardProps {
  projects: { id: string; name: string }[];
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

const Files = [
  {
    name: "File 1",
    type: 1,
    id: 0,
  },
  {
    name: "File 2",
    type: 1,
    id: 1,
  },
  {
    name: "File 3",
    type: 1,
    id: 2,
  },
  {
    name: "File 4",
    type: 1,
    id: 3,
  },
  
];

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  currentProjectId,
  projectData,
  onCreateProject,
  onOpenProject,
  onShowModal,
  onExportFile,
}) => {
  const [isClicked, setisClicked] = useState<number>(0);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-6 space-y-6">
        <h1 className="text-4xl font-bold">Welcome User!</h1>

        {/* File Type Tabs */}
        <div className="flex space-x-3">
          {Files.map((file) => (
            <button
              onClick={() => {
                setisClicked(file.id);
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                isClicked === file.id ? "bg-blue-600" : "bg-gray-700"
              }`}
              key={file.id}
            >
              File Type {file.id + 1}
            </button>
          ))}
        </div>

        <div className="flex flex-1 space-x-6">
          {/* File Grid */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {
              Files.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-700 rounded-2xl shadow-md flex items-end p-4 overflow-y-auto"
                >
                  <p className="font-medium">File {file.id + 1} of {isClicked + 1} Type</p>
                </div>
              ))}
          </div>

          {/* Right Terminal Section */}
          <div className="w-[30vw] max-w-3xl m-x-2 h-full">
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
