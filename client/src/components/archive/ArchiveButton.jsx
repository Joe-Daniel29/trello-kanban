import React from 'react';
import { FaArchive } from 'react-icons/fa';
import './ArchiveButton.css';

const ArchiveButton = ({ onClick }) => {
  return (
    <button 
      className="floating-archive-button" 
      onClick={onClick}
      title="View archived lists"
    >
      <FaArchive />
    </button>
  );
};

export default ArchiveButton;
