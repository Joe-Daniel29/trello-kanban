import React, { useState, useRef, useEffect } from 'react';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaArchive } from 'react-icons/fa';
import Task from '../task/Task.jsx';
import './List.css';
import taskService from '../../services/taskService.js';
import listService from '../../services/listService.js';

const List = ({ list, onTaskCreated, onTaskUpdated, id, onTaskMoved, onListArchived }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState(list.tasks || []);
  const [showArchiveButton, setShowArchiveButton] = useState(false);
  const inputRef = useRef(null);
  const composerRef = useRef(null);

  // Update tasks when list.tasks changes
  useEffect(() => {
    setTasks(list.tasks || []);
  }, [list.tasks]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,  // Use only the id prop, which should always be provided
    data: { type: 'list', list }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  };

  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus();
    }

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (composerRef.current && !composerRef.current.contains(event.target)) {
        setIsAddingTask(false);
        setNewTaskTitle('');
      }
    };

    if (isAddingTask) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingTask]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await taskService.createTask(
        list.board,
        list._id,
        { title: newTaskTitle.trim() }
      );

      onTaskCreated(list._id, newTask);
      setNewTaskTitle('');
      // Keep the input field active for adding more tasks
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask(e);
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  // Handle task movement within the same list
  const handleTaskMove = async (taskId, newIndex) => {
    const oldIndex = tasks.findIndex((task) => task._id === taskId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      // Update positions in the backend
      try {
        const positionsToUpdate = newTasks.map((task, index) => ({
          taskId: task._id,
          position: index,
        }));

        await taskService.updatePositions(
          list.board,
          list._id,
          positionsToUpdate
        );
      } catch (error) {
        console.error('Failed to update task positions:', error);
        // Revert to original order on error
        setTasks(tasks);
      }
    }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();

    try {
      await listService.archiveList(list.board, list._id);
      if (onListArchived) {
        onListArchived(list._id);
      }
    } catch (error) {
      console.error('Failed to archive list:', error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`list-wrapper ${isDragging ? 'is-dragging' : ''}`}
      onMouseEnter={() => setShowArchiveButton(true)}
      onMouseLeave={() => setShowArchiveButton(false)}
    >
      <div className="list-header" {...attributes} {...listeners}>
        <div className="drag-handle">
          <div className="dots-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        </div>
        <h3 className="list-title">{list.title}</h3>
        {showArchiveButton && (
          <button
            className="list-archive-button"
            onClick={handleArchive}
            title="Archive list"
          >
            <FaArchive />
          </button>
        )}
      </div>

      <div className="list-tasks" data-list-id={list._id}>
        {Array.isArray(tasks) && (
          <SortableContext
            items={tasks.map(task => task._id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <Task
                key={task._id}
                id={task._id}
                task={task}
                onTaskUpdated={onTaskUpdated}
                onTaskMoved={handleTaskMove}
              />
            ))}
          </SortableContext>
        )}
      </div>

      <div className="list-footer">
        {isAddingTask ? (
          <div className="add-task-composer" ref={composerRef}>
            <form onSubmit={handleAddTask}>
              <textarea
                ref={inputRef}
                className="add-task-input"
                placeholder="Enter a title for this card..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="add-task-controls">
                <button type="submit" className="add-task-confirm-button">
                  Add card
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="add-task-button"
            onClick={() => setIsAddingTask(true)}
          >
            <span className="add-icon">+</span> Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default List;

