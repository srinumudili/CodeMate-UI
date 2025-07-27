import React from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const status = error?.status || 500;
  const statusText = error?.statusText || "Unexpected Error";
  const data = error?.data || "Something went wrong.";

  return (
    <div className="hero min-h-screen bg-base-200 px-4">
      <div className="hero-content text-center">
        <div className="card shadow-2xl bg-base-100 p-8 max-w-md w-full">
          <div className="text-red-500 text-7xl font-bold mb-4">{status}</div>
          <h2 className="text-2xl font-semibold mb-2 text-base-content">
            {statusText}
          </h2>
          <p className="text-base-content/70 mb-4">{data}</p>

          <div className="mt-6">
            <Link to="/" className="btn btn-primary">
              ⬅️ Go to Home
            </Link>
          </div>

          {/* Optional: Show detailed error in collapsible panel */}
          <div className="mt-6">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title font-medium">
                Error Details (for devs)
              </div>
              <div className="collapse-content">
                <pre className="text-sm text-red-400 whitespace-pre-wrap break-words">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ErrorPage);
