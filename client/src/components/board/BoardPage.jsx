import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../../services/boardService';
import './BoardPage.css'; // We'll create this file for styling

const BoardPage = () => {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch boards when the component mounts
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardService.getBoards();
        setBoards(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boards');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Handle new board creation
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      setError('Board name is required');
      return;
    }
    try {
      setError(null);
      const newBoard = await boardService.createBoard({ name: newBoardName });
      setBoards([...boards, newBoard]); // Add new board to the list instantly
      setNewBoardName(''); // Clear the input
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    }
  };

  return (
    <div className="board-page-container">
      <div className="create-board-section">
        <h2 className="section-title">Create a New Board</h2>
        <form onSubmit={handleCreateBoard} className="create-board-form">
          <input
            type="text"
            className="create-board-input"
            placeholder="e.g., Project Phoenix..."
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <button type="submit" className="create-board-button">
            Create
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="boards-list-section">
        <h2 className="section-title">Your Boards</h2>
        {loading && <p>Loading boards...</p>}
        {!loading && boards.length === 0 && (
          <p className="no-boards-message">You haven't created any boards yet.</p>
        )}
        <div className="boards-grid">
          {boards.map((board) => (
            <Link
              key={board._id}
              to={`/board/${board._id}`}
              className="board-card-link"
            >
              <div className="board-card">
                <span className="board-card-title">{board.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardPage;

