import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { removeFeed } from "../utils/feedSlice";
import RequestShimmer from "./RequestShimmer";

const FallbackAvatar = () => (
  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 dark:text-gray-200 text-xl font-semibold">
    ?
  </div>
);

const Requests = () => {
  const [loading, setLoading] = useState(true);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/requests`,
        { withCredentials: true }
      );
      dispatch(addRequest(res?.data?.data));
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reviewRequest = useCallback(
    async (status, requestId) => {
      try {
        await axios.patch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/requests/review/${requestId}`,
          { status },
          { withCredentials: true }
        );
        dispatch(removeRequest(requestId));
        if (status === "accepted") {
          const request = requests.find((req) => req._id === requestId);
          const connectedUserId = request?.fromUserId?._id;
          if (connectedUserId) {
            dispatch(removeFeed(connectedUserId));
          }
        }
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    },
    [dispatch, requests]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const renderedRequests = useMemo(() => {
    return requests?.map((request) => {
      const { _id, firstName, lastName, profileUrl, about } =
        request.fromUserId;

      return (
        <div
          key={request._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-200 p-4 rounded-xl shadow transition hover:shadow-lg"
        >
          <div className="flex items-center gap-4 flex-1 mb-4 sm:mb-0">
            <div className="avatar">
              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt="profile"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "";
                    }}
                  />
                ) : (
                  <FallbackAvatar />
                )}
              </div>
            </div>

            <div>
              <p className="text-lg font-semibold capitalize text-base-content">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-base-content/70 line-clamp-2 max-w-xs">
                {about || "No about info"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline btn-success"
              onClick={() => reviewRequest("accepted", request._id)}
            >
              Accept
            </button>
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={() => reviewRequest("rejected", request._id)}
            >
              Reject
            </button>
          </div>
        </div>
      );
    });
  }, [requests, reviewRequest]);

  if (loading) return <RequestShimmer requestCount={requests?.length || 2} />;

  if (!requests?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen text-center">
        <h1 className="text-xl font-medium text-base-content/70">
          No Requests Found
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-base-content mb-8">
        Connection Requests
      </h1>
      <div className="space-y-4">{renderedRequests}</div>
    </div>
  );
};

export default Requests;
