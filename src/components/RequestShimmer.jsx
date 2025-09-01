import React from "react";

const RequestShimmer = ({ requestCount }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <div className="space-y-4 animate-pulse">
        {[...Array(requestCount)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-200 p-4 rounded-xl shadow-md"
          >
            <div className="flex items-center gap-4 flex-1 mb-4 sm:mb-0">
              <div className="avatar">
                <div className="w-16 h-16 rounded-full bg-gray-300" />
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-64"></div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="btn btn-sm btn-outline bg-gray-300 border-none w-20 h-10"></div>
              <div className="btn btn-sm btn-outline bg-gray-300 border-none w-20 h-10"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestShimmer;
