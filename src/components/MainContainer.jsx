import React, { memo } from "react";
import Feed from "./Feed";

const MainContainer = () => {
  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Feed />
    </main>
  );
};

export default memo(MainContainer);
