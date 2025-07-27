import React, { memo } from "react";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <header className="w-full shadow-sm z-50 sticky top-0 bg-base-100">
      <Navbar />
    </header>
  );
};

export default memo(Header);
