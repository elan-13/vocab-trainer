import React from 'react';
import { NavLink } from 'react-router-dom';
import { useVocab } from '../context/VocabContext';
import { LayoutDashboard, BookOpen, PlusCircle, Calendar, BarChart2, Zap } from 'lucide-react';

export const Navbar = () => {
  const { dueCount } = useVocab();

  return (
    <header className="navbar" id="main-navigation">
      <div className="nav-content">
        <NavLink to="/" className="brand" id="brand-logo" title="Back to Dashboard">
          <div className="brand-icon">
            <Zap size={20} />
          </div>
          <span className="brand-text">SRS VocabMaster</span>
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                id="nav-dashboard"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/review"
                id="nav-review"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                <span>Review</span>
                <span
                  id="nav-due-badge"
                  className={`badge-due ${dueCount === 0 ? 'zero' : ''}`}
                  title={`${dueCount} word${dueCount === 1 ? '' : 's'} ready for review`}
                >
                  {dueCount}
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/add"
                id="nav-add"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>Add Word</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/upcoming"
                id="nav-upcoming"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Calendar size={18} />
                <span>Upcoming</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/progress"
                id="nav-progress"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <BarChart2 size={18} />
                <span>Progress</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
