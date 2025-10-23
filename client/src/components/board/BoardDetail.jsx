import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
import List from '../list/List.jsx';
import Task from '../task/Task.jsx';
import './BoardDetail.css';

const BoardDetail = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeDragData, setActiveDragData] = useState(null);

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
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Failed to create list. Please try again.');
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

    setActiveId(null);
    setActiveDragData(null);
  };

  return (
    <div className="board-detail-container">
      <h2 className="board-title">{board.name}</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="lists-container">
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
                  />
                ))}
            </SortableContext>
          )}

          {/* Add List Form - Always visible */}
          <div className="add-list-wrapper">
            <form onSubmit={handleAddList} className="add-list-form">
              <input
                type="text"
                placeholder="Add a new list"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="add-list-input"
              />
              <button type="submit" className="add-list-button">
                Add List
              </button>
            </form>
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
    </div>
  );
};

export default BoardDetail;

