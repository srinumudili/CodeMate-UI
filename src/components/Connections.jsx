import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addConnection } from "../utils/connectionSlice";
import ConnectionsShimmer from "./ConnectionsShimmer";

const Connections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const connections = useSelector((store) => store.connections);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/connections`,
        { withCredentials: true }
      );
      dispatch(addConnection(res?.data?.data));
    } catch (error) {
      console.error(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!connections || connections.length === 0) {
      fetchConnections();
    } else {
      setLoading(false);
    }
  }, [fetchConnections, connections]);

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const renderedConnections = useMemo(
    () =>
      connections?.map((user) => (
        <div
          key={user._id}
          className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-base-100 rounded-2xl shadow-md p-5 hover:bg-base-300 transition-colors"
        >
          <div className="flex items-center gap-4 w-full">
            {user.profileUrl ? (
              <img
                src={user.profileUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-primary"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "";
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center border-4 border-primary">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-base-content capitalize">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-base-content capitalize">
                {user.age && user.gender && `${user.age}, ${user.gender}`}
              </p>
              {user.about && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {user.about}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/chat/${user._id}`)}
            className="btn btn-sm btn-primary px-6 mt-3 sm:mt-0"
          >
            Message
          </button>
        </div>
      )),
    [connections, navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-bold text-base-content mb-10">
          Your Connections
        </h1>
        <div className="max-w-4xl mx-auto space-y-6">
          {[...Array(connections?.length)].map((_, i) => (
            <ConnectionsShimmer key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-neutral-content">
          No Connections Found
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-4xl font-bold text-base-content mb-10">
        Your Connections
      </h1>
      <div className="max-w-4xl mx-auto space-y-6">{renderedConnections}</div>
    </div>
  );
};

export default React.memo(Connections);
