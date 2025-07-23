import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnection(res?.data?.data));
    } catch (error) {
      console.error(error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-400">
          No Connections Found
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-4xl font-bold text-white mb-10">
        Your Connections
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {connections.map((user) => (
          <div
            key={user._id}
            className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-base-100 rounded-2xl shadow-md p-5 hover:bg-base-300 transition-colors"
          >
            <div className="flex items-center gap-4 w-full">
              <img
                src={user.profileUrl || "https://placehold.co/100x100"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-primary"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white capitalize">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-400">
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
        ))}
      </div>
    </div>
  );
};

export default Connections;
