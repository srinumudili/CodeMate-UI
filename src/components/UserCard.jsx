import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();

  if (!user) return null;

  const { _id, firstName, lastName, profileUrl, age, gender, about } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeFeed(userId));
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto my-10">
      <div className="card shadow-2xl bg-base-100 rounded-3xl overflow-hidden">
        <figure className="relative">
          <img
            src={profileUrl}
            alt="profile"
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold capitalize">
              {firstName} {lastName}, {age}
            </h2>
            <p className="text-sm capitalize">{gender}</p>
            {about && <p className="text-xs mt-1">{about}</p>}
          </div>
        </figure>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <button
          className="btn btn-circle btn-outline btn-error text-xl"
          onClick={() => handleSendRequest("ignored", _id)}
        >
          ❌
        </button>
        <button
          className="btn btn-circle btn-primary text-xl"
          onClick={() => handleSendRequest("interested", _id)}
        >
          ❤️
        </button>
      </div>
    </div>
  );
};

export default UserCard;
