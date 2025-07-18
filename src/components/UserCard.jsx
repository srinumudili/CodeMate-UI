import React from "react";

const UserCard = ({ user }) => {
  if (!user) return null;

  const { firstName, lastName, profileUrl, age, gender, about } = user;

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
        <button className="btn btn-circle btn-outline btn-error text-xl">
          ❌
        </button>
        <button className="btn btn-circle btn-primary text-xl">❤️</button>
      </div>
    </div>
  );
};

export default UserCard;
