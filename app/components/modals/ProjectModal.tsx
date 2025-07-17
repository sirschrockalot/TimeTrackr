"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // If provided, edit mode; otherwise, create mode
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projectId }) => {
  const { createProject, updateProject, getProjectById, users, isLoading } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    color: "#3B82F6",
    status: "active" as "active" | "completed" | "on-hold",
    teamMembers: [] as string[],
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!projectId;

  // Load project data for editing
  useEffect(() => {
    if (isEditMode && projectId) {
      const project = getProjectById(projectId);
      if (project) {
        setFormData({
          name: project.name,
          client: project.client,
          color: project.color,
          status: project.status,
          teamMembers: project.teamMembers,
          description: project.description || "",
        });
      }
    }
  }, [isEditMode, projectId, getProjectById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.client.trim()) {
      newErrors.client = "Client name is required";
    }

    if (formData.teamMembers.length === 0) {
      newErrors.teamMembers = "At least one team member is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { formData, isEditMode });
    
    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    try {
      if (isEditMode && projectId) {
        const existingProject = getProjectById(projectId);
        if (existingProject) {
          await updateProject({
            ...existingProject,
            ...formData,
          });
        }
      } else {
        console.log("Creating new project", formData);
        await createProject({
          ...formData,
          tasks: [],
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const handleTeamMemberToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }));
  };

  const colorOptions = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Project" : "Create New Project"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.name ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.name}</p>
          )}
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Client *
          </label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            className={`w-full px-3 py-2 bg-[#2A2A3A] border rounded-md text-[#F3F3F5] focus:outline-none focus:border-[#4E9CF5] ${
              errors.client ? "border-[#EF4444]" : "border-[#3E3E50]"
            }`}
            placeholder="Enter client name"
          />
          {errors.client && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.client}</p>
          )}
        </div>

        {/* Project Color */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Project Color
          </label>
          <div className="flex space-x-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? "border-[#F3F3F5] scale-110" : "border-[#3E3E50]"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-[#8E8EA8] mb-2">
            Team Members *
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {users.map((user) => (
              <label key={user.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.teamMembers.includes(user.id)}
                  onChange={() => handleTeamMemberToggle(user.id)}
                  className="w-4 h-4 text-[#4E9CF5] bg-[#2A2A3A] border-[#3E3E50] rounded focus:ring-[#4E9CF5]"
                />
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: formData.color }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[#F3F3F5]">{user.name}</span>
                  <span className="text-[#8E8EA8] text-sm">({user.role})</span>
                </div>
              </label>
            ))}
          </div>
          {errors.teamMembers && (
            <p className="mt-1 text-sm text-[#EF4444]">{errors.teamMembers}</p>
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
            placeholder="Enter project description"
          />
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
            {isLoading ? "Saving..." : (isEditMode ? "Update Project" : "Create Project")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal; 