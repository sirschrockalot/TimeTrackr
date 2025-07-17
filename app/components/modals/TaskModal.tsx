"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // If provided, edit mode; otherwise, create mode
  projectId?: string; // Pre-select project when creating task
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId, projectId }) => {
  const { createTask, updateTask, getTaskById, projects, users, isLoading } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    projectId: projectId || "",
    name: "",
    description: "",
    status: "todo" as "todo" | "in-progress" | "completed",
    assignedTo: "",
    estimatedHours: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!taskId;

  // Load task data for editing
  useEffect(() => {
    if (isEditMode && taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setFormData({
          projectId: task.projectId,
          name: task.name,
          description: task.description,
          status: task.status,
          assignedTo: task.assignedTo,
          estimatedHours: task.estimatedHours || 0,
        });
      }
    } else if (projectId) {
      setFormData(prev => ({ ...prev, projectId }));
    }
  }, [isEditMode, taskId, projectId, getTaskById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = "Assignee is required";
    }

    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = "Estimated hours cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const taskData = {
        projectId: formData.projectId,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo,
        estimatedHours: formData.estimatedHours || undefined,
      };

      if (isEditMode && taskId) {
        const existingTask = getTaskById(taskId);
        if (existingTask) {
          await updateTask({
            ...existingTask,
            ...taskData,
          });
        }
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  // Get team members for selected project
  const selectedProject = projects.find(p => p.id === formData.projectId);
  const availableUsers = selectedProject 
    ? users.filter(user => selectedProject.teamMembers.includes(user.id))
    : users;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Task" : "Create New Task"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Project *
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value, assignedTo: "" }))}
            disabled={isEditMode} // Don't allow changing project in edit mode
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.projectId ? "border-[#EF4444]" : "border-[#3E3E50]"
            } disabled:opacity-50`}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.projectId}</p>
          )}
        </div>

        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Task Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.name ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
            placeholder="Enter task name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-[#2A2A3A] border border-[#3E3E50] rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5]"
            placeholder="Enter task description"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full px-3 py-2 bg-[#2A2A3A] border border-[#3E3E50] rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5]"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Assigned To *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            disabled={!formData.projectId}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.assignedTo ? "border-[#EF4444]" : "border-[#3E3E50]"
            } disabled:opacity-50`}
          >
            <option value="">Select assignee</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.assignedTo}</p>
          )}
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Estimated Hours
          </label>
          <input
            type="number"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
            min="0"
            step="0.5"
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.estimatedHours ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
            placeholder="0"
          />
          {errors.estimatedHours && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.estimatedHours}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-[#2A2A3A]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#F3F3F5] bg-[#2A2A3A] border border-[#3E3E50] rounded-md hover:bg-[#3E3E50] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-[#4E9CF5] rounded-md hover:bg-[#3E8BE0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : (isEditMode ? "Update Task" : "Create Task")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal; 