import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Task.css';
import taskService from '../../services/taskService';

// This component receives the task and two functions from its parent (List.jsx)
const Task = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [isChecked, setIsChecked] = useState(task.isCompleted);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: { type: 'task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  };

  const handleToggleComplete = async (e) => {
    // Stop the click from bubbling up to the main task (which might open a modal later)
    e.stopPropagation();

    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState); // Update UI instantly

    try {
      // Send the update to the backend
      const updatedTask = await taskService.updateTask(
        task.board,
        task.list,
        task._id,
        { isCompleted: newCheckedState }
      );

      // Notify the parent (BoardDetail) of the change
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
      // If the API call fails, revert the checkbox
      setIsChecked(!newCheckedState);
    }
  };
  // --- --- --- --- ---

  // Add a class if the task is completed for strike-through styling
  const taskClassName = `task-card ${isChecked ? 'task-completed' : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${taskClassName} ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-checkbox-wrapper" onClick={handleToggleComplete}>
        <div className={`task-checkbox ${isChecked ? 'checked' : ''}`}>
          {/* Animated checkmark */}
          {isChecked && (
            <svg
              className="task-check-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 9.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
              />
            </svg>
          )}
        </div>
      </div>
      {/* --- --- --- --- --- */}

      <span className="task-title">{task.title}</span>
    </div>
  );
};

export default Task;

