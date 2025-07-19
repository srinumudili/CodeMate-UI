import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

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
        <h1 className="text-xl font-semibold text-gray-300">
          No Connections Found
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl sm:text-4xl font-bold text-white mb-10">
        Your Connections
      </h1>

      <div className="max-w-4xl mx-auto grid gap-6">
        {connections.map((user) => (
          <div
            key={user._id}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-base-100 shadow-lg rounded-2xl p-5 transition-transform hover:scale-[1.01]"
          >
            <img
              src={user.profileUrl || "https://placehold.co/100x100"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold capitalize text-white">
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
        ))}
      </div>
    </div>
  );
};

export default Connections;
