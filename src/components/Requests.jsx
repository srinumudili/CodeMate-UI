import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });
      dispatch(addRequest(res?.data?.data));
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0)
    return (
      <h1 className="text-center text-xl font-semibold mt-10">
        No Requests Found
      </h1>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Connection Requests
      </h1>

      <div className="space-y-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, profileUrl, about } =
            request.fromUserId;

          return (
            <div
              key={_id}
              className="flex items-center justify-between bg-base-100 p-4 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={profileUrl}
                      alt="profile"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-base font-semibold">
                    {firstName} {lastName}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                    {about || "No about info"}
                  </p>
                </div>
              </div>

              {/* Buttons (always visible or hover-controlled) */}
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() => reviewRequest("accepted", request._id)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-sm btn-outline btn-error"
                  onClick={() => reviewRequest("rejected", request._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
