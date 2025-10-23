import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Task from '../task/Task.jsx';
import './List.css';
import taskService from '../../services/taskService.js';

const List = ({ list, onTaskCreated, onTaskUpdated, id }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState(list.tasks || []);
  const [activeDragData, setActiveDragData] = useState(null);
  const inputRef = useRef(null);
  const composerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveDragData({ type: 'task', task });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id);
      const newIndex = tasks.findIndex((task) => task._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);

        // Update positions in the backend
        try {
          const positionsToUpdate = newTasks.map((task, index) => ({
            taskId: task._id,
            position: index,
          }));

          console.log('Updating positions:', {
            boardId: list.board,
            listId: list._id,
            positions: positionsToUpdate
          });

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
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`list-wrapper ${isDragging ? 'is-dragging' : ''}`}>
      <div className="list-header" {...attributes} {...listeners}>
        <div className="drag-handle">
          <div className="dots-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        </div>
        <h3 className="list-title">{list.title}</h3>
      </div>

      <div className="list-tasks">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
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
                />
              ))}
            </SortableContext>
          )}

          <DragOverlay>
            {activeDragData?.type === 'task' && (
              <Task
                task={activeDragData.task}
                isDragging={true}
              />
            )}
          </DragOverlay>
        </DndContext>
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

