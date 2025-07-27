import React from "react";

const ConnectionsShimmer = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-base-100 rounded-2xl shadow-md p-5 animate-pulse">
      <div className="flex items-center gap-4 w-full">
        <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-primary"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>

      <div className="btn btn-sm bg-gray-300 border-none w-24 h-10 mt-3 sm:mt-0"></div>
    </div>
  );
};

export default ConnectionsShimmer;
