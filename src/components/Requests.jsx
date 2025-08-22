// src/components/Request.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests, reviewRequest } from "../utils/redux/requestSlice";
import RequestShimmer from "./RequestShimmer";

const Request = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleReview = async (requestId, status) => {
    try {
      await dispatch(reviewRequest({ status, requestId })).unwrap();
    } catch (err) {
      console.error("Review Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <RequestShimmer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error shadow-lg w-full max-w-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-500">
          Connection Requests
        </h1>
        <p className="mt-2 text-lg text-gray-400">No connection requests.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center p-4 gap-6">
      <h1 className="text-3xl font-bold text-primary mb-2">
        Connection Requests
      </h1>

      {requests.map((req) => (
        <div
          key={req._id}
          className="w-full max-w-md bg-base-100 rounded-xl shadow-md overflow-hidden border border-base-300"
        >
          {/* Header */}
          <div className="flex items-center p-3">
            <div className="avatar">
              <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={req.fromUserId?.profileUrl}
                  alt={req.fromUserId?.username}
                />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <h2 className="font-semibold text-sm sm:text-base truncate">
                {req.fromUserId?.firstName} {req.fromUserId?.lastName}
                {req.fromUserId?.age && (
                  <span className="ml-1 text-gray-500 text-xs">
                    ({req.fromUserId.age})
                  </span>
                )}
              </h2>
              <p
                className="text-xs text-gray-500 truncate"
                title={req.fromUserId?.about || "No bio available"}
              >
                {req.fromUserId?.about || "No bio available"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 px-3 pb-3">
            <button
              className="btn btn-primary btn-xs rounded-full px-4"
              onClick={() => handleReview(req._id, "accepted")}
            >
              Accept
            </button>
            <button
              className="btn btn-outline btn-xs rounded-full px-4"
              onClick={() => handleReview(req._id, "rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(Request);
