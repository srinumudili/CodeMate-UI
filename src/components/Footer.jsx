import { memo } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
      <aside>
        <p>Copyright © {currentYear} - All right reserved by CodeMate</p>
      </aside>
    </footer>
  );
};

export default memo(Footer);
