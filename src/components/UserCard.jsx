import React, { useCallback } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";

const UserCard = ({ user, isFeedCard }) => {
  const dispatch = useDispatch();

  const handleSendRequest = useCallback(
    async (status, userId) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/requests/send/${userId}`,
          { status },
          { withCredentials: true }
        );
        dispatch(removeFeed(userId));
      } catch (error) {
        console.error(error?.response?.data || "Request failed");
      }
    },
    [dispatch]
  );

  if (!user) return null;

  const { _id, firstName, lastName, profileUrl, age, gender, about, skills } =
    user;

  return (
    <div className="w-full max-w-sm mx-auto my-6">
      <div className="card bg-base-100 shadow-2xl rounded-3xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] group">
        <figure className="relative h-80">
          <img
            src={profileUrl || "/vite.svg"}
            alt={`${firstName} ${lastName}'s profile`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/vite.svg";
            }}
            loading="lazy"
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent text-white p-5">
            <h2 className="text-2xl font-bold capitalize">
              {firstName} {lastName}
              <span className="text-base font-light">, {age}</span>
            </h2>
            <p className="text-sm capitalize text-pink-200">{gender}</p>
            {about && (
              <p className="text-sm mt-2 text-white/80 line-clamp-4">{about}</p>
            )}
          </div>
        </figure>

        <div className="card-body p-5 pt-4">
          {skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="badge badge-primary badge-outline capitalize px-3 py-1"
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          {isFeedCard && (
            <div className="mt-6 flex justify-center gap-5">
              <button
                className="btn btn-outline btn-error w-12 h-12 text-xl tooltip"
                data-tip="Ignore"
                onClick={() => handleSendRequest("ignored", _id)}
              >
                ❌
              </button>
              <button
                className="btn btn-primary w-12 h-12 text-xl tooltip"
                data-tip="Send Interest"
                onClick={() => handleSendRequest("interested", _id)}
              >
                ❤️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserCard);
