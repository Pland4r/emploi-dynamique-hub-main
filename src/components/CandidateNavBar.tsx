import { NavLink, useNavigate } from "react-router-dom";

const CandidateNavBar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white border-b shadow-sm mb-6">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `font-semibold text-base px-3 py-2 rounded hover:bg-blue-50 transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
          }
        >
          Tableau de bord
        </NavLink>
        <NavLink
          to="/saved-jobs"
          className={({ isActive }) =>
            `font-semibold text-base px-3 py-2 rounded hover:bg-blue-50 transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
          }
        >
          Offres sauvegardées
        </NavLink>
        <NavLink
          to="/applications-history"
          className={({ isActive }) =>
            `font-semibold text-base px-3 py-2 rounded hover:bg-blue-50 transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
          }
        >
          Historique des candidatures
        </NavLink>
        <NavLink
          to="/my-cv"
          className={({ isActive }) =>
            `font-semibold text-base px-3 py-2 rounded hover:bg-blue-50 transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
          }
        >
          Mon CV
        </NavLink>
      </div>
    </nav>
  );
};

export default CandidateNavBar; 