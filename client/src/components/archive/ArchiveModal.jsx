import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaUndo } from 'react-icons/fa';
import listService from '../../services/listService.js';
import './ArchiveModal.css';

const ArchiveModal = ({ isOpen, onClose, boardId, onListUnarchived }) => {
  const [archivedLists, setArchivedLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (isOpen && boardId) {
      fetchArchivedLists();
    }
  }, [isOpen, boardId]);

  const fetchArchivedLists = async () => {
    try {
      setLoading(true);
      const lists = await listService.getArchivedLists(boardId);
      setArchivedLists(lists);
    } catch (error) {
      console.error('Failed to fetch archived lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (listId) => {
    try {
      const response = await listService.unarchiveList(boardId, listId);
      // Remove from archived lists
      setArchivedLists(archivedLists.filter(list => list._id !== listId));
      // Notify parent component
      if (onListUnarchived) {
        onListUnarchived(response.list);
      }
    } catch (error) {
      console.error('Failed to unarchive list:', error);
    }
  };

  const handleDeleteClick = (listId) => {
    setDeleteConfirmId(listId);
  };

  const handleDeleteConfirm = async (listId) => {
    try {
      await listService.deleteList(boardId, listId);
      // Remove from archived lists
      setArchivedLists(archivedLists.filter(list => list._id !== listId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await listService.deleteAllArchivedLists(boardId);
      setArchivedLists([]);
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Failed to delete all archived lists:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="archive-modal-overlay" onClick={onClose}>
      <div className="archive-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="archive-modal-header">
          <h2>Archived Lists</h2>
          <button className="archive-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="archive-modal-body">
          {loading ? (
            <div className="archive-loading">Loading archived lists...</div>
          ) : archivedLists.length === 0 ? (
            <div className="archive-empty">No archived lists</div>
          ) : (
            <>
              <div className="archived-lists">
                {archivedLists.map((list) => (
                  <div key={list._id} className="archived-list-item">
                    <div className="archived-list-info">
                      <h3>{list.title}</h3>
                      <p className="archived-list-meta">
                        {list.tasks?.length || 0} card{list.tasks?.length !== 1 ? 's' : ''}
                        {' • '}
                        Archived {new Date(list.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="archived-list-actions">
                      <button
                        className="archive-action-btn unarchive-btn"
                        onClick={() => handleUnarchive(list._id)}
                        title="Unarchive list"
                      >
                        <FaUndo /> Unarchive
                      </button>
                      {deleteConfirmId === list._id ? (
                        <button
                          className="archive-action-btn confirm-delete-btn"
                          onClick={() => handleDeleteConfirm(list._id)}
                          title="Confirm deletion"
                        >
                          <FaTrash /> Confirm?
                        </button>
                      ) : (
                        <button
                          className="archive-action-btn delete-btn"
                          onClick={() => handleDeleteClick(list._id)}
                          title="Delete permanently"
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {archivedLists.length > 0 && (
                <div className="archive-modal-footer">
                  {!showDeleteAllConfirm ? (
                    <button
                      className="delete-all-btn"
                      onClick={() => setShowDeleteAllConfirm(true)}
                    >
                      <FaTrash /> Delete All Archived Lists
                    </button>
                  ) : (
                    <div className="delete-all-confirm">
                      <p>Are you sure? This will permanently delete all {archivedLists.length} archived list{archivedLists.length !== 1 ? 's' : ''}.</p>
                      <div className="delete-all-actions">
                        <button
                          className="confirm-delete-btn"
                          onClick={handleDeleteAll}
                        >
                          Yes, Delete All
                        </button>
                        <button
                          className="cancel-delete-btn"
                          onClick={() => setShowDeleteAllConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
