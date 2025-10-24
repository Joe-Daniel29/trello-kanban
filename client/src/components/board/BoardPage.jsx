import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../../services/boardService';
import './BoardPage.css';

function BoardPage() {
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddingBoard, setIsAddingBoard] = useState(false);
    const boardInputRef = React.useRef(null);
    const boardComposerRef = React.useRef(null);

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

    useEffect(() => {
        if (isAddingBoard && boardInputRef.current) {
            boardInputRef.current.focus();
        }

        const handleClickOutside = (event) => {
            if (boardComposerRef.current && !boardComposerRef.current.contains(event.target)) {
                setIsAddingBoard(false);
                setNewBoardName('');
            }
        };

        if (isAddingBoard) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddingBoard]);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) {
            return;
        }

        try {
            setError(null);
            const newBoard = await boardService.createBoard({ name: newBoardName });
            // Add the new board to the existing list
            setBoards((prevBoards) => [...prevBoards, newBoard]);
            setNewBoardName(''); // Clear the input field
            // Keep the composer open for adding more boards
            if (boardInputRef.current) {
                boardInputRef.current.focus();
            }
        } catch (err) {
            setError('Failed to create board. Please try again.');
            console.error(err);
        }
    };

    const handleBoardKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCreateBoard(e);
        } else if (e.key === 'Escape') {
            setIsAddingBoard(false);
            setNewBoardName('');
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

            {/* Boards Grid Section */}
            <div className="boards-section">
                <h2 className="section-title">Your Boards</h2>

                {loading ? (
                    <div className="loading-indicator">Loading your boards...</div>
                ) : (
                    <div className="boards-grid">
                        {Array.isArray(boards) && boards.length > 0 && (
                            boards.map((board) => (
                                <Link
                                    to={`/board/${board._id}`}
                                    key={board._id}
                                    className="board-card"
                                >
                                    <div className="board-card-content">
                                        <h3>{board.name}</h3>
                                        <div className="board-card-arrow">→</div>
                                    </div>
                                </Link>
                            ))
                        )}
                        
                        {/* Create Board Card */}
                        {isAddingBoard ? (
                            <div className="board-card create-board-composer" ref={boardComposerRef}>
                                <form onSubmit={handleCreateBoard} className="create-board-form-inline">
                                    <div className="create-board-input-wrapper">
                                        <input
                                            ref={boardInputRef}
                                            type="text"
                                            value={newBoardName}
                                            onChange={(e) => setNewBoardName(e.target.value)}
                                            onKeyDown={handleBoardKeyDown}
                                            placeholder="Enter board name..."
                                            className="create-board-input"
                                            maxLength="50"
                                        />
                                        <button type="submit" className="create-board-confirm-button">
                                            Add
                                        </button>
                                    </div>
                                </form>
                                {error && <div className="error-message">{error}</div>}
                            </div>
                        ) : (
                            <button
                                className="board-card create-board-button"
                                onClick={() => setIsAddingBoard(true)}
                            >
                                <div className="board-card-content">
                                    <h3><span className="add-icon">+</span> Create new board</h3>
                                </div>
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default BoardPage;

