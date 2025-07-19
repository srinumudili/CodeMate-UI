import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";

const UserCard = ({ user, isFeedCard }) => {
  const dispatch = useDispatch();

  if (!user) return null;

  const { _id, firstName, lastName, profileUrl, age, gender, about } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeFeed(userId));
    } catch (error) {
      console.error(error?.response?.data || "Request failed");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-6">
      <div className="card shadow-2xl bg-base-100 rounded-3xl overflow-hidden">
        <figure className="relative">
          <img
            src={profileUrl || "/vite.svg"}
            alt={`${firstName} ${lastName}'s profile`}
            className="w-full h-80 object-cover"
            onError={(e) => (e.target.src = "/vite.svg")}
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent text-white p-4">
            <h2 className="text-2xl font-bold capitalize">
              {firstName} {lastName}
              <span className="text-lg font-medium">, {age}</span>
            </h2>
            <p className="text-sm capitalize">{gender}</p>
            {about && <p className="text-xs mt-1 line-clamp-3">{about}</p>}
          </div>
        </figure>
      </div>

      {isFeedCard && (
        <div className="flex justify-center gap-6 mt-4">
          <button
            className="btn btn-circle btn-outline btn-error hover:scale-110 transition"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            ❌
          </button>
          <button
            className="btn btn-circle btn-primary hover:scale-110 transition"
            onClick={() => handleSendRequest("interested", _id)}
          >
            ❤️
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;
