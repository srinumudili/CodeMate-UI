import React from "react";

const UserCardShimmer = () => {
  return (
    <div className="w-full max-w-sm mx-auto my-6 animate-pulse space-y-4">
      <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden">
        <figure className="relative h-80 bg-gray-300" />
        <div className="p-4 space-y-2">
          <div className="h-6 bg-gray-400 rounded w-3/4"></div>
          <div className="h-4 bg-gray-400 rounded w-1/4"></div>
          <div className="h-3 bg-gray-400 rounded w-full"></div>
          <div className="h-3 bg-gray-400 rounded w-5/6"></div>
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <div className="btn btn-circle bg-gray-300 border-none w-12 h-12"></div>
        <div className="btn btn-circle bg-gray-300 border-none w-12 h-12"></div>
      </div>
    </div>
  );
};

export default UserCardShimmer;
