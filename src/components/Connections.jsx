import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConnections } from "../utils/redux/connectionSlice";
import ConnectionsShimmer from "./ConnectionsShimmer";

const Connections = () => {
  const dispatch = useDispatch();
  const { list: connections, loading } = useSelector(
    (state) => state.connections
  );

  useEffect(() => {
    if (!connections || connections.length === 0) {
      dispatch(fetchConnections({ page: 1, limit: 20 }));
    }
  }, [dispatch, connections]);

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const renderedConnections = useMemo(
    () =>
      connections?.map((user) => (
        <div
          key={user._id}
          className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border border-base-300 overflow-hidden group"
        >
          <div className="flex flex-col items-center sm:flex-row sm:items-center p-6 gap-5">
            {/* Avatar */}
            {user.profileUrl ? (
              <img
                src={user.profileUrl}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "";
                }}
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary text-white font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-primary group-hover:scale-105 transition-transform duration-300">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-base-content capitalize">
                {user.firstName} {user.lastName}
              </h2>

              {user.age && user.gender && (
                <p className="text-sm text-neutral">
                  {user.age}, {user.gender}
                </p>
              )}

              {user.about && (
                <p
                  className="text-sm text-base-content/80 mt-2 line-clamp-2 tooltip tooltip-top"
                  data-tip={user.about}
                >
                  {user.about}
                </p>
              )}
            </div>
          </div>
        </div>
      )),
    [connections]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl sm:text-4xl font-bold text-base-content mb-10">
          Your Connections
        </h1>
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
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
    <div className="min-h-screen bg-base-200 py-8 px-3 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold text-base-content mb-8">
        Your Connections
      </h1>
      <div className="max-w-5xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {renderedConnections}
      </div>
    </div>
  );
};

export default React.memo(Connections);
