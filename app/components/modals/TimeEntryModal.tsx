"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId?: string; // If provided, edit mode; otherwise, create mode
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ isOpen, onClose, entryId }) => {
  const { createTimeEntry, updateTimeEntry, getTimeEntriesByUser, getProjectById, getTaskById, projects, tasks, isLoading } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    startTime: "",
    endTime: "",
    description: "",
    billable: true,
    rate: 85,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!entryId;

  // Get available tasks for selected project
  const availableTasks = tasks.filter(task => task.projectId === formData.projectId);

  // Load time entry data for editing
  useEffect(() => {
    if (isEditMode && entryId && user) {
      const userEntries = getTimeEntriesByUser(user.id);
      const entry = userEntries.find(e => e.id === entryId);
      if (entry) {
        setFormData({
          projectId: entry.projectId,
          taskId: entry.taskId,
          startTime: entry.startTime.slice(0, 16), // Format for datetime-local input
          endTime: entry.endTime ? entry.endTime.slice(0, 16) : "",
          description: entry.description,
          billable: entry.billable,
          rate: entry.rate || 85,
        });
      }
    }
  }, [isEditMode, entryId, user, getTimeEntriesByUser]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }

    if (!formData.taskId) {
      newErrors.taskId = "Task is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      const startTime = new Date(formData.startTime).toISOString();
      const endTime = new Date(formData.endTime).toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);

      const timeEntryData = {
        userId: user.id,
        projectId: formData.projectId,
        taskId: formData.taskId,
        startTime,
        endTime,
        duration,
        description: formData.description,
        isRunning: false,
        billable: formData.billable,
        rate: formData.rate,
      };

      if (isEditMode && entryId) {
        const userEntries = getTimeEntriesByUser(user.id);
        const existingEntry = userEntries.find(e => e.id === entryId);
        if (existingEntry) {
          await updateTimeEntry({
            ...existingEntry,
            ...timeEntryData,
          });
        }
      } else {
        await createTimeEntry(timeEntryData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save time entry:", error);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectId,
      taskId: "", // Reset task when project changes
    }));
  };

  const formatDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Time Entry" : "Add Time Entry"}
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
            onChange={(e) => handleProjectChange(e.target.value)}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.projectId ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
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

        {/* Task Selection */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Task *
          </label>
          <select
            value={formData.taskId}
            onChange={(e) => setFormData(prev => ({ ...prev, taskId: e.target.value }))}
            disabled={!formData.projectId}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.taskId ? "border-[#EF4444]" : "border-[#3E3E50]"
            } disabled:opacity-50`}
          >
            <option value="">Select a task</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          {errors.taskId && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.taskId}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
                errors.startTime ? "border-[#EF4444]" : "border-[#3E3E50]"
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
                errors.endTime ? "border-[#EF4444]" : "border-[#3E3E50]"
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-[#EF4444]">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {formData.startTime && formData.endTime && (
          <div className="bg-[#242435] rounded-md p-3">
            <span className="text-[#8E8EA8] text-sm">Duration: </span>
            <span className="text-[#4E9CF5] font-medium">
              {formatDuration(formData.startTime, formData.endTime)}
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.description ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
            placeholder="What did you work on?"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.description}</p>
          )}
        </div>

        {/* Billing Options */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
              className="w-4 h-4 text-[#4E9CF5] bg-[#2A2A3A] border-[#3E3E50] rounded focus:ring-[#4E9CF5]"
            />
            <label htmlFor="billable" className="ml-2 text-sm text-[#C2C2CC]">
              Billable time
            </label>
          </div>

          {formData.billable && (
            <div>
              <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-[#2A2A3A] border border-[#3E3E50] rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5]"
              />
            </div>
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
            {isLoading ? "Saving..." : (isEditMode ? "Update Entry" : "Add Entry")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TimeEntryModal; 