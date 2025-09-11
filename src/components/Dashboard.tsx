import React from "react";
import Navbar from "./Navbar";

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col p-6 space-y-6">
        <h1 className="text-4xl font-bold">Welcome User!</h1>

        {/* File Type Tabs */}
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 rounded-lg font-medium">File Type 1</button>
          <button className="px-4 py-2 bg-gray-700 rounded-lg font-medium">File Type 2</button>
          <button className="px-4 py-2 bg-gray-700 rounded-lg font-medium">File Type 3</button>
          <button className="px-4 py-2 bg-gray-700 rounded-lg font-medium">File Type 4</button>
        </div>

        <div className="flex flex-1 space-x-6">
          {/* File Grid */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-700 rounded-2xl shadow-md flex items-end p-4"
                >
                  <p className="font-medium">File 1 of nth Type</p>
                </div>
              ))}
          </div>

          {/* Right Terminal Section */}
          <div className="w-1/3 bg-gray-800 rounded-xl p-4 flex flex-col justify-between border border-gray-700">
            <div>
              <h2 className="font-semibold mb-2">Welcome to double excel terminal</h2>
              <p className="text-gray-400 text-sm">
                Type help to show our commands
              </p>
            </div>
            <input
              type="text"
              placeholder=""
              className="w-full bg-gray-900 rounded-md mt-4 p-2 outline-none text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
