import React from "react";

const UserCardShimmer = () => {
  return (
    <div className="w-full max-w-sm mx-auto my-6 animate-pulse">
      <div className="card bg-base-100 shadow-xl rounded-3xl overflow-hidden relative">
        <figure className="relative h-80">
          <div className="w-full h-full bg-gray-300"></div>
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent p-5">
            <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-400 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-400 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-400 rounded w-5/6"></div>
          </div>
        </figure>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="btn btn-circle bg-gray-300 border-none w-12 h-12"></div>
        <div className="btn btn-circle bg-gray-300 border-none w-12 h-12"></div>
      </div>
    </div>
  );
};

export default UserCardShimmer;
