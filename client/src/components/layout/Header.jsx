import React from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" className="header-logo-link">
        <h1>Kanban Board</h1>
      </Link>
      <HamburgerMenu />
    </header>
  );
};

export default Header;
