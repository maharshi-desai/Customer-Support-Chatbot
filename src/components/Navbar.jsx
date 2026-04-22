import { BarChart3, BotMessageSquare, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand-block">
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>

        <div>
          <p className="brand-title">E-Commerce Support AI</p>
          <p className="brand-subtitle">
            Smart AI-powered customer support for orders, returns, payments, and
            account issues.
          </p>
          <div className="brand-badge">Domain: E-Commerce</div>
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          <BotMessageSquare size={18} />
          <span>Chat</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
