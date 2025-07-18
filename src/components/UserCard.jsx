import React from "react";

const UserCard = ({ user }) => {
  const { firstName, lastName, profileUrl, age, gender, about } = user;
  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-sm">
        <figure>
          <img src={profileUrl} alt="Profile Photo" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            {firstName} {lastName}
          </h2>
          <p>{about}</p>
          <p>{age && gender && `${age} ${gender}`}</p>
          <div className="card-actions justify-center">
            <button className="btn btn-primary">Ignore</button>
            <button className="btn btn-accent">Interest</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
