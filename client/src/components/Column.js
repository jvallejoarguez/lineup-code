import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const Column = ({ column, tasks, index, onAddTask, onDeleteColumn, onUpdateColumn, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-[280px] sm:w-[320px] flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden"
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
          >
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim()) {
                    onUpdateColumn(column.id, { ...column, title });
                    setIsEditing(false);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && title.trim()) {
                    onUpdateColumn(column.id, { ...column, title });
                    setIsEditing(false);
                  }
                }}
                className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                <h3
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {column.title}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tasks.length}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={onAddTask}
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => onDeleteColumn(column.id)}
                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tasks Container */}
          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-2 min-h-[200px] transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <Task
                      key={task.id}
                      task={task}
                      index={index}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

// Task Component
const Task = ({ task, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        >
          <div className="p-3">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                  autoFocus
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 rounded border-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Description"
                  rows={2}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (title.trim()) {
                        onUpdate(task.id, { ...task, title, description });
                        setIsEditing(false);
                      }
                    }}
                    className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <h4
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {task.title}
                  </h4>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Column; 