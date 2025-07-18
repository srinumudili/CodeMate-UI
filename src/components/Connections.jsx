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
      console.error(error.response.data);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return (
      <h1 className="text-center text-xl font-semibold text-gray-300 mt-10">
        No Connections Found
      </h1>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-6">
      <h1 className="text-center text-4xl font-bold text-white mb-8">
        Connections
      </h1>

      <div className="max-w-3xl mx-auto space-y-4">
        {connections.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-4 bg-base-100 shadow-md rounded-xl p-4"
          >
            <img
              src={user.profileUrl || "https://placehold.co/100x100"}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold capitalize text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-400">
                {user.age && user.gender && `${user.age}, ${user.gender}`}
              </p>
              {user.about && (
                <p className="text-sm text-gray-500 line-clamp-2">
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
