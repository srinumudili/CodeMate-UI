import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";
import RequestShimmer from "./RequestShimmer";
import { removeFeed } from "../utils/feedSlice";

const Requests = () => {
  const [loading, setLoading] = useState(true);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/requests`,
        {
          withCredentials: true,
        }
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
        await axios.post(
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
    [dispatch]
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
          className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-200 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center gap-4 flex-1 mb-4 sm:mb-0">
            <div className="avatar">
              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={profileUrl || "https://placehold.co/100x100"}
                  alt="profile"
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/100x100";
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-lg font-semibold text-white capitalize">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-gray-400 line-clamp-2 max-w-xs">
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

  if (loading) return <RequestShimmer requestCount={requests?.length || 3} />;

  if (!requests?.length)
    return (
      <h1 className="text-center text-xl font-semibold mt-10 text-gray-400">
        No Requests Found
      </h1>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Connection Requests
      </h1>
      <div className="space-y-4">{renderedRequests}</div>
    </div>
  );
};

export default Requests;
