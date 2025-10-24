import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaGripLines, FaGripLinesVertical } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import boardService from '../../services/boardService.js';
import listService from '../../services/listService.js';
import taskService from '../../services/taskService.js';
import List from '../list/List.jsx';
import Task from '../task/Task.jsx';
import ArchiveButton from '../archive/ArchiveButton.jsx';
import ArchiveModal from '../archive/ArchiveModal.jsx';
import './BoardDetail.css';

const BoardDetail = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeDragData, setActiveDragData] = useState(null);
  const [isVerticalScroll, setIsVerticalScroll] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const listInputRef = React.useRef(null);
  const listComposerRef = React.useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use useCallback to memoize the fetch function
  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await boardService.getBoardById(boardId);
      setBoard(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch board details:', err);
      setError('Failed to fetch board details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    if (isAddingList && listInputRef.current) {
      listInputRef.current.focus();
    }

    const handleClickOutside = (event) => {
      if (listComposerRef.current && !listComposerRef.current.contains(event.target)) {
        setIsAddingList(false);
        setNewListName('');
      }
    };

    if (isAddingList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingList]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const newList = await listService.createList(boardId, {
        name: newListName, // Our service transforms this to 'title'
      });
      // Update the board state with the new list
      setBoard((prevBoard) => ({
        ...prevBoard,
        lists: [...prevBoard.lists, newList],
      }));
      setNewListName('');
      // Keep the composer open for adding more lists
      if (listInputRef.current) {
        listInputRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Failed to create list. Please try again.');
    }
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddList(e);
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setNewListName('');
    }
  };

  const handleTaskCreated = (listId, newTask) => {
    setBoard((prevBoard) => {
      // Create a deep copy of the lists
      const newLists = prevBoard.lists.map((list) => {
        if (list._id === listId) {
          // Add the new task to the correct list
          const updatedTasks = Array.isArray(list.tasks)
            ? [...list.tasks, newTask]
            : [newTask];
          return { ...list, tasks: updatedTasks };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  };

  // --- NEW FUNCTION ---
  const handleTaskUpdated = (updatedTask) => {
    setBoard((prevBoard) => {
      const newLists = prevBoard.lists.map((list) => {
        // Find the list that contains the updated task
        if (list._id === updatedTask.list) {
          // Map over the tasks and replace the one that was updated
          const updatedTasks = list.tasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          );
          return { ...list, tasks: updatedTasks };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  };

  const handleTaskMoved = (listId, taskId, newIndex) => {
    setBoard((prevBoard) => {
      const newLists = prevBoard.lists.map((list) => {
        if (list._id === listId) {
          const oldIndex = list.tasks.findIndex((task) => task._id === taskId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newTasks = arrayMove(list.tasks, oldIndex, newIndex);
            return { ...list, tasks: newTasks };
          }
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  };

  const handleListArchived = (listId) => {
    setBoard((prevBoard) => {
      const newLists = prevBoard.lists.filter(list => list._id !== listId);
      return { ...prevBoard, lists: newLists };
    });
  };

  const handleListUnarchived = (unarchivedList) => {
    setBoard((prevBoard) => {
      // Add the unarchived list back to the board
      const newLists = [...prevBoard.lists, unarchivedList];
      return { ...prevBoard, lists: newLists };
    });
  };
  // --- --- --- --- ---

  if (loading) {
    return <div className="board-loading">Loading board...</div>;
  }

  if (error) {
    return <div className="board-error">{error}</div>;
  }

  if (!board) {
    return <div className="board-error">Board not found.</div>;
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle list reordering
      if (activeData?.type === 'list' && overData?.type === 'list') {
        setBoard((prevBoard) => {
          const oldIndex = prevBoard.lists.findIndex((list) => list._id === active.id);
          const newIndex = prevBoard.lists.findIndex((list) => list._id === over.id);

          const newLists = arrayMove(prevBoard.lists, oldIndex, newIndex);

          // Update positions in the backend
          listService.updatePositions(
            boardId,
            newLists.map((list, index) => ({
              listId: list._id,
              position: index,
            }))
          );

          return {
            ...prevBoard,
            lists: newLists,
          };
        });
      }
      // Handle task movement between lists
      else if (activeData?.type === 'task' && overData?.type === 'list') {
        const task = activeData.task;
        const targetListId = over.id;
        const sourceListId = task.list;

        if (sourceListId !== targetListId) {
          try {
            // Move task to new list
            await taskService.moveTask(boardId, task._id, sourceListId, targetListId, 0);

            // Update local state
            setBoard((prevBoard) => {
              const newLists = prevBoard.lists.map((list) => {
                if (list._id === sourceListId) {
                  // Remove task from source list
                  return {
                    ...list,
                    tasks: list.tasks.filter(t => t._id !== task._id)
                  };
                } else if (list._id === targetListId) {
                  // Add task to target list
                  return {
                    ...list,
                    tasks: [task, ...list.tasks]
                  };
                }
                return list;
              });
              return { ...prevBoard, lists: newLists };
            });
          } catch (error) {
            console.error('Failed to move task:', error);
          }
        }
      }
      // Handle task movement within the same list (fallback to list's own handler)
      else if (activeData?.type === 'task' && overData?.type === 'task') {
        // This will be handled by the individual list's DndContext
        return;
      }
    }

    setActiveId(null);
    setActiveDragData(null);
  };

  return (
    <div className="board-detail-container">
      <div className="board-header">
        <h2 className="board-title">{board.name}</h2>
        <div className="scroll-toggle-container">
          <button
            className={`scroll-toggle ${!isVerticalScroll ? 'active' : ''}`}
            onClick={() => setIsVerticalScroll(false)}
            title="Horizontal scroll"
          >
            <FaGripLines />
          </button>
          <button
            className={`scroll-toggle ${isVerticalScroll ? 'active' : ''}`}
            onClick={() => setIsVerticalScroll(true)}
            title="Vertical scroll"
          >
            <FaGripLinesVertical />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`lists-container ${isVerticalScroll ? 'vertical-scroll' : 'horizontal-scroll'}`}>
          {/* Lists */}
          {board.lists && board.lists.length > 0 && (
            <SortableContext
              items={board.lists.map(list => list._id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.lists
                .filter(list => list && list._id) // Filter out any invalid lists
                .map((list) => (
                  <List
                    key={list._id}
                    id={list._id}
                    list={list}
                    onTaskCreated={handleTaskCreated}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskMoved={handleTaskMoved}
                    onListArchived={handleListArchived}
                  />
                ))}
            </SortableContext>
          )}

          {/* Add List Form - Collapsible */}
          <div className="add-list-wrapper">
            {isAddingList ? (
              <div className="add-list-composer" ref={listComposerRef}>
                <form onSubmit={handleAddList}>
                  <input
                    ref={listInputRef}
                    type="text"
                    placeholder="Enter list title..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={handleListKeyDown}
                    className="add-list-input"
                  />
                  <div className="add-list-controls">
                    <button type="submit" className="add-list-confirm-button">
                      Add list
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                className="add-list-button"
                onClick={() => setIsAddingList(true)}
              >
                <span className="add-icon">+</span> Add a list
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId && activeDragData ? (
            activeDragData.type === 'list' ? (
              <List
                list={activeDragData.list}
                id={activeId}
                isDragging={true}
              />
            ) : (
              <Task
                task={activeDragData.task}
                isDragging={true}
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Archive Button */}
      <ArchiveButton onClick={() => setIsArchiveModalOpen(true)} />

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        boardId={boardId}
        onListUnarchived={handleListUnarchived}
      />
    </div>
  );
};

export default BoardDetail;

