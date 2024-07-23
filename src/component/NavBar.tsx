import { faHome, faTasks, faUserFriends, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import React from 'react';

const NavBar = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-gray-900 py-3 flex justify-around text-white shadow-xl">
        <NavLink
          to="/home"
          className={({ isActive }) => 
            `flex flex-col items-center text-gray-600 text-sm ${isActive ? 'text-[#4ade80]' : ''} hover:text-white transition-all duration-300`
          }
        >
          <FontAwesomeIcon icon={faHome} className="text-lg mb-1" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => 
            `flex flex-col items-center text-gray-400 text-sm ${isActive ? 'text-[#4ade80]' : ''} hover:text-white transition-all duration-300`
          }
        >
          <FontAwesomeIcon icon={faTasks} className="text-lg mb-1" />
          <span>Tasks</span>
        </NavLink>
        <NavLink
          to="/frens"
          className={({ isActive }) => 
            `flex flex-col items-center text-gray-400 text-sm ${isActive ? 'text-[#4ade80]' : ''} hover:text-white transition-all duration-300`
          }
        >
          <FontAwesomeIcon icon={faUserFriends} className="text-lg mb-1" />
          <span>Frens</span>
        </NavLink>
        {/* <NavLink
          to="/wallet"
          className={({ isActive }) => 
            `flex flex-col items-center text-gray-400 text-sm ${isActive ? 'text-#4ade80' : ''} hover:text-white transition-all duration-300`
          }
        >
          <FontAwesomeIcon icon={faWallet} className="text-lg mb-1" />
          <span>Wallet</span>
        </NavLink> */}
      </nav>
    </div>
  );
}

export default NavBar;
