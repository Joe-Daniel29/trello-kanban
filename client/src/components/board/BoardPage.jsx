import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../../services/boardService';
import './BoardPage.css';

function BoardPage() {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardService.getBoards();
        setBoards(data || []); // Ensure boards is always an array
      } catch (err) {
        setError('Failed to fetch boards. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      setError('Board name is required.');
      return;
    }

    try {
      setError(null);
      const newBoard = await boardService.createBoard({ name: newBoardName });
      // Add the new board to the existing list
      setBoards((prevBoards) => [...prevBoards, newBoard]);
      setNewBoardName(''); // Clear the input field
    } catch (err) {
      setError('Failed to create board. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="board-page-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, {user?.name?.toUpperCase() || 'USER'}!</h1>
        <p>Organize your projects with ease</p>
      </div>

      {/* Create Board Section */}
      <div className="create-board-section">
        <form onSubmit={handleCreateBoard} className="create-board-form">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Enter board name..."
            className="create-board-input"
            maxLength="50"
          />
          <button type="submit" className="create-board-button">
            Create Board
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Boards Grid Section */}
      <div className="boards-section">
        <h2 className="section-title">Your Boards</h2>
        
        {loading ? (
          <div className="loading-indicator">Loading your boards...</div>
        ) : (
          <div className="boards-grid">
            {Array.isArray(boards) && boards.length > 0 ? (
              boards.map((board) => (
                <Link
                  to={`/board/${board._id}`}
                  key={board._id}
                  className="board-card"
                >
                  <div className="board-card-content">
                    <h3>{board.name}</h3>
                    <span className="board-card-arrow">→</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-boards-message">
                <p>No boards yet</p>
                <p>Create your first board to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardPage;

