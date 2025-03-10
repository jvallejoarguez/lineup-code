import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useLocation } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import NavigationBar from '../components/NavigationBar';
import { supabase } from '../config/supabase';

// Cursor Mode enum
const CursorMode = {
  MOVE: 'move',
  EDIT: 'edit'
};

// Color options for columns - updated for better dark mode
const columnColors = {
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
};

// Remove the initial columns and tasks, replace with empty objects
const initialColumns = {
  'column-1': {
    id: 'column-1',
    title: 'To Do',
    taskIds: [],
    color: 'blue'
  },
  'column-2': {
    id: 'column-2',
    title: 'In Progress',
    taskIds: [],
    color: 'green'
  },
  'column-3': {
    id: 'column-3',
    title: 'Done',
    taskIds: [],
    color: 'purple'
  }
};

const initialTasks = {};

// Keep the initialWorkflows as is
const initialWorkflows = [
  { id: 'workflow-1', title: 'Current Project' },
  { id: 'workflow-2', title: 'Personal Tasks' },
  { id: 'workflow-3', title: 'Team Sprint' },
];

// Confirmation Modal Component - updated for better dark mode
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Cursor Toggle for switching between drag (move) and edit mode
const CursorToggle = ({ mode, setMode }) => {
  return (
    <button
      onClick={() => setMode(mode === CursorMode.MOVE ? CursorMode.EDIT : CursorMode.MOVE)}
      className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow"
      title={`Switch to ${mode === CursorMode.MOVE ? 'edit' : 'move'} mode`}
    >
      {mode === CursorMode.MOVE ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Icon for move mode */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Icon for edit mode */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      )}
    </button>
  );
};

// Subtask Component - updated for better dark mode
const Subtask = ({ subtask, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);
  const [description, setDescription] = useState(subtask.description || '');

  const handleUpdate = () => {
    if (title.trim()) {
      onUpdate({ ...subtask, title, description });
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-start p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 group">
      {/* Checkbox for completion */}
      <div 
        onClick={() => onUpdate({ ...subtask, completed: !subtask.completed })}
        className={`flex-shrink-0 w-4 h-4 mt-0.5 border rounded cursor-pointer transition-colors duration-200 
          ${subtask.completed 
            ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
            : 'border-gray-300 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
      >
        {subtask.completed && (
          <svg className="w-full h-full text-white" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0 ml-2">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleUpdate();
              }}
              onBlur={handleUpdate}
              className="w-full bg-white dark:bg-gray-600 px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-gray-100"
              placeholder="Subtask title"
              autoFocus
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleUpdate();
              }}
              onBlur={handleUpdate}
              className="w-full bg-white dark:bg-gray-600 px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-gray-100"
              placeholder="Subtask description (optional)"
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)} 
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <h5 className={`text-sm font-medium ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                {subtask.title}
              </h5>
            </div>
            {description && (
              <p className={`text-xs mt-0.5 ${subtask.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={() => onDelete()} 
        className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Task Component - updated for better dark mode
const Task = ({ task, index, onDelete, onUpdateTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [newSubtask, setNewSubtask] = useState('');

  const handleUpdateTitle = (e) => {
    if (e.key === 'Enter' && title.trim()) {
      onUpdateTask(task.id, { ...task, title });
      setIsEditing(false);
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      // Create a new subtask with a unique id and a default completed flag
      const newSubtaskObj = { id: `${Date.now()}`, title: newSubtask, description: '', completed: false };
      onUpdateTask(task.id, {
        ...task,
        subtasks: [...(task.subtasks || []), newSubtaskObj]
      });
      setNewSubtask('');
    }
  };

  // Calculate completion percentage for the progress bar
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
  const progressPercentage = subtasks.length > 0 
    ? Math.round((completedSubtasks / subtasks.length) * 100) 
    : 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        // Preserve library's transform to keep the item under the cursor
        let draggableStyle = {
          ...provided.draggableProps.style,
          // Optionally raise zIndex during drag to ensure it's on top
          ...(snapshot.isDragging ? { zIndex: 9999 } : {})
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={draggableStyle}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 transition-all duration-200 ease-in-out border border-transparent dark:border-gray-700 ${
              snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 opacity-90' : 'hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start">
              <div {...provided.dragHandleProps} className="mt-1 mr-2 cursor-grab flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={handleUpdateTitle}
                    onBlur={() => {
                      if (title.trim()) {
                        onUpdateTask(task.id, { ...task, title });
                        setIsEditing(false);
                      }
                    }}
                    className="w-full bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 font-medium text-sm"
                    autoFocus
                  />
                ) : (
                  <h3 
                    onClick={() => setIsEditing(true)} 
                    className="cursor-pointer text-gray-900 dark:text-gray-100 font-medium text-sm line-clamp-2"
                  >
                    {task.title}
                  </h3>
                )}
                
                {/* Subtask progress indicator */}
                {subtasks.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{completedSubtasks} of {subtasks.length} subtasks</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 dark:bg-green-600 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center ml-2 space-x-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {/* Subtasks */}
                <div className="space-y-2">
                  {subtasks.map((subtask, idx) => (
                    <Subtask
                      key={subtask.id}
                      subtask={subtask}
                      index={idx}
                      onUpdate={(updatedSubtask) => {
                        const updatedSubtasks = [...subtasks];
                        updatedSubtasks[idx] = updatedSubtask;
                        onUpdateTask(task.id, { ...task, subtasks: updatedSubtasks });
                      }}
                      onDelete={() => {
                        const updatedSubtasks = subtasks.filter((_, i) => i !== idx);
                        onUpdateTask(task.id, { ...task, subtasks: updatedSubtasks });
                      }}
                    />
                  ))}
                </div>

                {/* Add subtask form */}
                <form onSubmit={handleAddSubtask} className="mt-3">
                  <div className="flex">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask..."
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-l-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtask.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-r-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
};

// Column Component
const Column = ({
  column,
  tasks,
  index,
  onAddTask,
  onDeleteColumn,
  onUpdateColumn,
  onUpdateTask,
  onDeleteTask
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Get the actual color class from the columnColors object
  const colorClass = columnColors[column.color || 'blue'];

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => {
        const style = {
          ...provided.draggableProps.style,
          margin: '0 0.5rem',
          width: 'min(80vw, 280px)', // Better mobile sizing
          height: 'fit-content', // Allow column to fit content but max height is set by container
          ...(snapshot.isDragging ? { zIndex: 9999 } : {})
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`flex-shrink-0 flex flex-col ${colorClass} rounded-lg transition-all duration-200 ease-in-out ${
              snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 opacity-90' : 'shadow'
            }`}
            style={style}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center relative w-full overflow-hidden">
                <div {...provided.dragHandleProps} className="flex-shrink-0 mr-2 cursor-grab">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && columnTitle.trim()) {
                      onUpdateColumn(column.id, { ...column, title: columnTitle });
                      e.target.blur();
                    }
                  }}
                  onBlur={() => {
                    if (columnTitle.trim()) {
                      onUpdateColumn(column.id, { ...column, title: columnTitle });
                    }
                  }}
                  className="flex-1 min-w-0 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white font-bold truncate"
                />
                <div className="flex-shrink-0 flex items-center">
                  <button onClick={() => setShowColorPicker(!showColorPicker)} className="ml-2 flex-shrink-0">
                    <span role="img" aria-label="color">🎨</span>
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="ml-2 text-red-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              {showColorPicker && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.keys(columnColors).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        onUpdateColumn(column.id, { ...column, color });
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full ${columnColors[color]} border border-gray-300 dark:border-gray-600`}
                      aria-label={`Set column color to ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Task List - Scrollable Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Droppable droppableId={column.id} type="task">
                {(droppableProvided, droppableSnapshot) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className={`flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${
                      droppableSnapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-600/50' : ''
                    }`}
                    style={{
                      minHeight: '50px',
                      maxHeight: 'calc(100vh - 250px)', // Fixed height that works on both mobile and desktop
                    }}
                  >
                    {tasks.map((task, index) => (
                      <Task
                        key={task.id}
                        task={task}
                        index={index}
                        onDelete={onDeleteTask}
                        onUpdateTask={onUpdateTask}
                      />
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Add Task Button */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700/50">
              <button 
                onClick={onAddTask} 
                className="w-full flex items-center justify-center py-1.5 px-3 rounded bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Task</span>
              </button>
            </div>

            <ConfirmationModal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={() => {
                onDeleteColumn(column.id);
                setShowDeleteConfirm(false);
              }}
              title="Delete Column"
              message="Are you sure you want to delete this column and all its tasks?"
            />
          </div>
        );
      }}
    </Draggable>
  );
};

// New Workflow Modal Component - updated for better dark mode
const NewWorkflowModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Create New Workflow
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onSave({
              title: formData.get('title'),
              description: formData.get('description')
            });
          }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="My New Workflow"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="What is this workflow for?"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Create Workflow
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Workflow Layout Component
const WorkflowLayout = ({ children, sidebarContent, headerContent }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DarkModeToggle className="fixed top-4 right-4 z-50" />
      <NavigationBar />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {sidebarContent}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            {headerContent}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-x-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Workflow Component
const Workflow = () => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [tasks, setTasks] = useState({});
  const [showMobileWorkflowMenu, setShowMobileWorkflowMenu] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  const [showDeleteWorkflowConfirm, setShowDeleteWorkflowConfirm] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(CursorMode.MOVE);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Add this to get the query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const shouldAddNewTask = queryParams.get('newTask') === 'true';

  // Effect to hide swipe hint after 3 seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Fetch workflows when component mounts
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Fetch columns and tasks when active workflow changes
  useEffect(() => {
    if (activeWorkflow) {
      fetchColumnsAndTasks(activeWorkflow);
    }
  }, [activeWorkflow]);

  // Add this useEffect to handle the newTask query parameter
  useEffect(() => {
    if (shouldAddNewTask && activeWorkflow && columnOrder.length > 0) {
      console.log("Auto-adding task from query parameter");
      // Find the first column (usually "To Do") to add the task to
      const firstColumnId = columnOrder[0];
      if (firstColumnId && columns[firstColumnId]) {
        handleAddTask(firstColumnId);
        
        // Clear the query parameter after adding the task
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.delete('newTask');
        window.history.replaceState(
          {}, 
          '', 
          `${location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`
        );
      }
    }
  }, [activeWorkflow, columnOrder, columns, shouldAddNewTask]);

  // Fetch all workflows for the current user
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setWorkflows(data);
        setActiveWorkflow(data[0].id);
      } else {
        // Create a default workflow for new users
        await createDefaultWorkflow(user.id);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a default workflow for new users
  const createDefaultWorkflow = async (userId) => {
    try {
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert([{
          title: 'Current Project',
          user_id: userId
        }])
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Create default columns with colors
      const columnsToCreate = [
        { title: 'To Do', workflow_id: workflow.id, order: 0, color: 'blue' },
        { title: 'In Progress', workflow_id: workflow.id, order: 1, color: 'green' },
        { title: 'Done', workflow_id: workflow.id, order: 2, color: 'purple' }
      ];

      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .insert(columnsToCreate)
        .select();

      if (columnsError) throw columnsError;

      setWorkflows([workflow]);
      setActiveWorkflow(workflow.id);
    } catch (error) {
      console.error('Error creating default workflow:', error);
    }
  };

  // Fetch columns and tasks for a specific workflow
  const fetchColumnsAndTasks = async (workflowId) => {
    try {
      setLoading(true);
      
      // Fetch columns for this workflow
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('order', { ascending: true });

      if (columnsError) throw columnsError;

      // Prepare columns state
      const columnsObj = {};
      const columnOrderArray = [];
      
      columnsData.forEach(column => {
        columnsObj[column.id] = {
          ...column,
          taskIds: []
        };
        columnOrderArray.push(column.id);
      });

      // Fetch tasks with their subtasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks(*)
        `)
        .in('column_id', columnOrderArray)
        .order('order', { ascending: true });

      if (tasksError) throw tasksError;

      // Prepare tasks state
      const tasksById = {};
      
      tasksData.forEach(task => {
        const columnId = task.column_id;
        tasksById[task.id] = {
          ...task,
          subtasks: task.subtasks || []
        };
        
        // Add task ID to its column's taskIds array
        if (columnsObj[columnId]) {
          columnsObj[columnId].taskIds.push(task.id);
        }
      });

      // Update state
      setColumns(columnsObj);
      setColumnOrder(columnOrderArray);
      setTasks(tasksById);
    } catch (error) {
      console.error('Error fetching columns and tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Column handler
  const handleAddColumn = async () => {
    try {
      // Get the next order value (current length of columns)
      const nextOrder = columnOrder.length;
      
      // Create a new column with the order field
      const newColumn = {
        title: 'New Column',
        workflow_id: activeWorkflow,
        color: 'blue',
        order: nextOrder // Add the order field
      };
      
      const { data, error } = await supabase
        .from('columns')
        .insert([newColumn])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setColumns(prev => ({
        ...prev,
        [data.id]: {
          ...data,
          taskIds: []
        }
      }));
      
      setColumnOrder(prev => [...prev, data.id]);
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  // Fix the handleAddTask function to be cleaner without console logs
  const handleAddTask = async (columnId) => {
    try {
      // Ensure column exists
      if (!columns[columnId]) {
        return;
      }

      // Simplify the task object to only include fields we know exist
      const newTask = {
        title: 'New Task',
        description: '',
        column_id: columnId,
        order: columns[columnId].taskIds.length
      };

      // Insert the task
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        return;
      }

      // Update the local state with the new task
      const taskWithEmptySubtasks = {
        ...data,
        subtasks: []
      };

      // Add the task to the tasks state
      setTasks(prev => ({
        ...prev,
        [data.id]: taskWithEmptySubtasks
      }));

      // Add the task ID to the column's taskIds array
      setColumns(prev => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          taskIds: [...prev[columnId].taskIds, data.id]
        }
      }));
    } catch (error) {
      // Silent error handling
    }
  };

  // Delete Column handler
  const handleDeleteColumn = async (columnId) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev => {
        const newColumns = { ...prev };
        delete newColumns[columnId];
        return newColumns;
      });
      setColumnOrder(prev => prev.filter(id => id !== columnId));
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  // Update Column handler
  const handleUpdateColumn = async (columnId, updatedColumn) => {
    try {
      // Prepare update data
      const updateData = {
        title: updatedColumn.title,
        color: updatedColumn.color
      };

      // Update in database
      const { error } = await supabase
        .from('columns')
        .update(updateData)
        .eq('id', columnId);

      if (error) throw error;

      // Update local state
      setColumns(prev => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          ...updateData
        }
      }));
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  // Fix the handleUpdateTask function to properly handle subtask updates
  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      // Extract subtasks to handle them separately
      const { subtasks, ...taskData } = updatedTask;
      
      // Prepare update data with only fields that exist in the database
      const updateData = {
        title: taskData.title,
        description: taskData.description || ''
      };
      
      // Update the task in the database
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // Handle subtasks if they've changed
      if (subtasks && Array.isArray(subtasks)) {
        // Fetch all current subtasks for this task
        const { data: existingSubtasks, error: fetchError } = await supabase
          .from('subtasks')
          .select('*')
          .eq('task_id', taskId);
          
        if (fetchError) {
          console.error('Error fetching existing subtasks:', fetchError);
          return;
        }

        // Create a map of existing subtasks by ID for easier lookup
        const existingSubtaskMap = {};
        existingSubtasks.forEach(sub => {
          existingSubtaskMap[sub.id] = sub;
        });
        
        // For each subtask in the updated task
        for (const subtask of subtasks) {
          if (existingSubtaskMap[subtask.id]) {
            // Update existing subtask - only update necessary fields
            const { error: updateError } = await supabase
              .from('subtasks')
              .update({
                title: subtask.title,
                completed: !!subtask.completed // Ensure boolean value
              })
              .eq('id', subtask.id);
            
            if (updateError) {
              console.error('Error updating subtask:', updateError.message);
            }
          } else {
            // This is a new subtask, create it with all required fields
            const newSubtask = {
              title: subtask.title,
              completed: !!subtask.completed, // Ensure boolean value
              task_id: taskId
            };
            
            const { data: createdSubtask, error: createError } = await supabase
              .from('subtasks')
              .insert([newSubtask])
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating subtask:', createError.message);
            } else if (createdSubtask) {
              // Update the client-side subtask with the server-generated ID
              subtask.id = createdSubtask.id;
            }
          }
        }
        
        // Delete any subtasks that are no longer in the list
        const currentSubtaskIds = subtasks.map(s => s.id);
        const subtasksToDelete = existingSubtasks.filter(s => !currentSubtaskIds.includes(s.id));
        
        if (subtasksToDelete.length > 0) {
          const subtaskIdsToDelete = subtasksToDelete.map(s => s.id);
          
          const { error: deleteError } = await supabase
            .from('subtasks')
            .delete()
            .in('id', subtaskIdsToDelete);

          if (deleteError) {
            console.error('Error deleting subtasks:', deleteError.message);
          }
        }
      }

      // Update local state with potentially updated subtask IDs
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...updatedTask,
          subtasks: subtasks || []
        }
      }));
    } catch (error) {
      console.error('Error in handleUpdateTask:', error.message);
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId) => {
    try {
      // First delete the task from the database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      // Then update the local state
      setTasks(prev => {
        const newTasks = { ...prev };
        delete newTasks[taskId];
        return newTasks;
      });
      
      // Remove task from its column's taskIds array
      setColumns(prev => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach(colId => {
          newColumns[colId].taskIds = newColumns[colId].taskIds.filter(id => id !== taskId);
        });
        return newColumns;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Delete workflow
  const handleDeleteWorkflow = async (workflowId) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      // Update state
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      
      // If we deleted the active workflow, switch to another one
      if (workflowId === activeWorkflow) {
        const remainingWorkflows = workflows.filter(w => w.id !== workflowId);
        if (remainingWorkflows.length > 0) {
          setActiveWorkflow(remainingWorkflows[0].id);
        } else {
          setActiveWorkflow(null);
          setColumns({});
          setColumnOrder([]);
          setTasks({});
        }
      }
      
      setShowDeleteWorkflowConfirm(false);
      setWorkflowToDelete(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  // Fix the handleDragEnd function to properly update column orders in the database
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Handle column reordering
      if (type === 'column') {
        const newColumnOrder = Array.from(columnOrder);
        newColumnOrder.splice(source.index, 1);
        newColumnOrder.splice(destination.index, 0, draggableId);
        
        // Update local state immediately
        setColumnOrder(newColumnOrder);

        // Update column orders in database - fix the format of the updates
        const updates = newColumnOrder.map((columnId, index) => ({
          id: columnId,
          order: index
        }));

        // Use a proper upsert operation with all required fields
        for (const update of updates) {
          const { error } = await supabase
            .from('columns')
            .update({ order: update.order })
            .eq('id', update.id);
          
          if (error) {
            console.error('Error updating column order:', error);
            throw error;
          }
        }
        
        return;
      }

      // Handle task reordering
      if (type === 'task') {
        const startColumn = columns[source.droppableId];
        const endColumn = columns[destination.droppableId];

        // Moving within the same column
        if (startColumn === endColumn) {
          const newTaskIds = Array.from(startColumn.taskIds);
          newTaskIds.splice(source.index, 1);
          newTaskIds.splice(destination.index, 0, draggableId);

          const newColumn = {
            ...startColumn,
            taskIds: newTaskIds,
          };

          // Update local state
          setColumns(prev => ({
            ...prev,
            [newColumn.id]: newColumn,
          }));

          // Update task orders individually to avoid missing required fields
          for (let i = 0; i < newTaskIds.length; i++) {
            const taskId = newTaskIds[i];
            const { error } = await supabase
              .from('tasks')
              .update({ order: i })
              .eq('id', taskId);
            
            if (error) {
              console.error('Error updating task order:', error);
              throw error;
            }
          }
          
          return;
        }

        // Moving to a different column
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartColumn = {
          ...startColumn,
          taskIds: startTaskIds,
        };

        const endTaskIds = Array.from(endColumn.taskIds);
        endTaskIds.splice(destination.index, 0, draggableId);
        const newEndColumn = {
          ...endColumn,
          taskIds: endTaskIds,
        };

        // Update local state
        setColumns(prev => ({
          ...prev,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn,
        }));

        // First update the moved task with its new column and order
        const { error } = await supabase
          .from('tasks')
          .update({
            column_id: endColumn.id,
            order: destination.index,
          })
          .eq('id', draggableId);

        if (error) {
          console.error('Error updating task column and order:', error);
          throw error;
        }

        // Then update the order of tasks in the start column
        for (let i = 0; i < startTaskIds.length; i++) {
          const taskId = startTaskIds[i];
          const { error } = await supabase
            .from('tasks')
            .update({ order: i })
            .eq('id', taskId);
          
          if (error) {
            console.error('Error updating start column task order:', error);
            throw error;
          }
        }

        // Finally update the order of tasks in the end column
        for (let i = 0; i < endTaskIds.length; i++) {
          const taskId = endTaskIds[i];
          // Skip the task we already updated
          if (taskId === draggableId) continue;
          
          const { error } = await supabase
            .from('tasks')
            .update({ order: i })
            .eq('id', taskId);
          
          if (error) {
            console.error('Error updating end column task order:', error);
            throw error;
          }
        }
      }

      // Handle subtask reordering
      if (type === 'subtask') {
        const taskId = source.droppableId.replace('subtasks-', '');
        const task = tasks[taskId];
        
        if (!task) return;

        const newSubtasks = Array.from(task.subtasks || []);
        const [movedSubtask] = newSubtasks.splice(source.index, 1);
        newSubtasks.splice(destination.index, 0, movedSubtask);

        // Update local state
        setTasks(prev => ({
          ...prev,
          [taskId]: {
            ...task,
            subtasks: newSubtasks,
          },
        }));

        // Update subtask orders in database
        const updates = newSubtasks.map((subtask, index) => ({
          id: subtask.id,
          order: index,
        }));

        const { error } = await supabase
          .from('subtasks')
          .upsert(updates);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating column order:', error);
      // Optionally revert the local state changes if the database update fails
    }
  };

  // Create new workflow
  const handleCreateWorkflow = async (workflowData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          ...workflowData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Update state
      setWorkflows(prev => [data, ...prev]);
      setActiveWorkflow(data.id);
      setShowNewWorkflowModal(false);
      
      // Clear existing columns and tasks
      setColumns({});
      setColumnOrder([]);
      setTasks({});
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  // Fix the handleAddSubtask function to be cleaner without console logs
  const handleAddSubtask = async (taskId, subtaskTitle) => {
    try {
      // Create the subtask with ONLY title and task_id
      const newSubtask = {
        title: subtaskTitle,
        task_id: taskId
      };
      
      // Insert the subtask
      const { data, error } = await supabase
        .from('subtasks')
        .insert([newSubtask])
        .select()
        .single();

      if (error) {
        return;
      }

      // Use the UUID from the database response
      const subtaskWithDbId = {
        ...data,
        id: data.id
      };

      // Update local state
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          subtasks: [...prev[taskId].subtasks, subtaskWithDbId]
        }
      }));
    } catch (error) {
      // Silent error handling
    }
  };

  const renderSidebar = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workflows</h2>
      </div>
      
      <button
        onClick={() => setShowNewWorkflowModal(true)}
        className="w-full mb-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Workflow</span>
      </button>

      <div className="space-y-1">
        {workflows.map(workflow => (
          <div key={workflow.id} className="group relative">
            <button
              onClick={() => setActiveWorkflow(workflow.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeWorkflow === workflow.id
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activeWorkflow === workflow.id
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
                <span className="font-medium">{workflow.title}</span>
              </div>
            </button>
            <button
              onClick={() => {
                setWorkflowToDelete(workflow.id);
                setShowDeleteWorkflowConfirm(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile workflow menu button */}
          <button 
            onClick={() => setShowMobileWorkflowMenu(true)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {workflows.find(w => w.id === activeWorkflow)?.title || 'Workflow'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Any other header controls can go here */}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkflowLayout
      sidebarContent={renderSidebar()}
      headerContent={renderHeader()}
    >
      {/* Mobile Workflows Menu Drawer */}
      <AnimatePresence>
        {showMobileWorkflowMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileWorkflowMenu(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {renderSidebar()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 h-[calc(100vh-120px)] overflow-hidden">
        <div className="h-full p-4 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="inline-flex h-full space-x-4 pb-6 pt-1"
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns[columnId];
                    if (!column) return null;

                    const columnTasks = column.taskIds
                      .map(taskId => tasks[taskId])
                      .filter(Boolean);

                    return (
                      <Column
                        key={columnId}
                        column={column}
                        tasks={columnTasks}
                        index={index}
                        onAddTask={() => handleAddTask(column.id)}
                        onDeleteColumn={handleDeleteColumn}
                        onUpdateColumn={handleUpdateColumn}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    );
                  })}
                  {provided.placeholder}
                  
                  {/* Add Column Button */}
                  <div className="flex-shrink-0 flex items-start">
                    <button
                      onClick={handleAddColumn}
                      className="w-[280px] h-12 flex items-center justify-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:shadow transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Column</span>
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Mobile hint for swiping */}
      {showSwipeHint && (
        <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Swipe to see more columns</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewWorkflowModal
        isOpen={showNewWorkflowModal}
        onClose={() => setShowNewWorkflowModal(false)}
        onSave={handleCreateWorkflow}
      />

      <ConfirmationModal
        isOpen={showDeleteWorkflowConfirm}
        onClose={() => {
          setShowDeleteWorkflowConfirm(false);
          setWorkflowToDelete(null);
        }}
        onConfirm={() => handleDeleteWorkflow(workflowToDelete)}
        title="Delete Workflow"
        message="Are you sure you want to delete this workflow? This action cannot be undone."
      />
    </WorkflowLayout>
  );
};

export default Workflow;
