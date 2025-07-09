import React from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const { data, status, statusText } = useRouteError();
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">{status}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {statusText}
        </h2>
        <p className="text-gray-600 mb-6">{data}</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
