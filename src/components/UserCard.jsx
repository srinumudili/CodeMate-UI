import React from "react";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/redux/feedSlice";
import { sendUserRequest } from "../utils/redux/requestSlice";
import { Heart, X } from "lucide-react";

const UserCard = ({ user, isFeedCard }) => {
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      await dispatch(sendUserRequest({ status, userId })).unwrap();
      dispatch(removeFeed(userId));
    } catch (err) {
      console.error("Request Error:", err);
    }
  };

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
                className="btn btn-outline btn-error btn-circle tooltip transition-transform hover:scale-110"
                data-tip="Ignore"
                onClick={(e) => {
                  handleSendRequest("ignored", _id);
                  e.currentTarget.blur();
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                className="btn btn-primary btn-circle tooltip transition-transform hover:scale-110"
                data-tip="Send Interest"
                onClick={(e) => {
                  handleSendRequest("interested", _id);
                  e.currentTarget.blur();
                }}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserCard);
