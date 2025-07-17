"use client";

import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Target,
  FolderOpen,
  CheckCircle,
  Pause
} from "lucide-react";
import { ProjectModal, TaskModal, ConfirmationModal } from "../components/modals";

const Projects = () => {
  const { user } = useAuth();
  const {
    projects,
    tasks,
    timeEntries,
    deleteProject,
    getProjectById,
    getTaskById,
    getTimeEntriesByProject,
    getTimeEntriesByUser
  } = useData();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Debug modal state
  console.log("Project modal isOpen:", isProjectModalOpen);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: "",
    search: ""
  });

  const userProjects = projects.filter(p => user && p.teamMembers.includes(user.id));
  const allTasks = tasks.filter(t => userProjects.some(p => p.id === t.projectId));

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
    setIsConfirmationModalOpen(true);
  };

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsTaskModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProjectId) {
      await deleteProject(deletingProjectId);
      setDeletingProjectId(null);
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectTimeEntries = getTimeEntriesByProject(projectId);
    const totalHours = projectTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const totalTasks = projectTasks.length;
    return {
      totalHours: totalHours.toFixed(1),
      completedTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FolderOpen className="nav-icon" size={16} />;
      case 'completed':
        return <CheckCircle className="nav-icon" size={16} />;
      case 'on-hold':
        return <Pause className="nav-icon" size={16} />;
      default:
        return <FolderOpen className="nav-icon" size={16} />;
    }
  };

  // Filter projects
  const filteredProjects = userProjects.filter(project => {
    if (filter.status && project.status !== filter.status) return false;
    if (filter.search && !project.name.toLowerCase().includes(filter.search.toLowerCase()) &&
      !project.client.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="title-large">Projects</h1>
            <p className="body-text">Manage your projects and tasks</p>
          </div>
          <button
            onClick={() => {
              console.log("New Project button clicked");
              setIsProjectModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Projects</div>
              <div className="stat-value">{userProjects.length}</div>
            </div>
            <div className="stat-icon">
              <FolderOpen className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Active Projects</div>
              <div className="stat-value">{userProjects.filter(p => p.status === 'active').length}</div>
            </div>
            <div className="stat-icon">
              <CheckCircle className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Tasks</div>
              <div className="stat-value">{allTasks.length}</div>
            </div>
            <div className="stat-icon">
              <Target className="nav-icon" size={20} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-header">
            <div>
              <div className="label-text">Total Hours</div>
              <div className="stat-value">
                {(userProjects.reduce((sum, project) => {
                  const projectEntries = getTimeEntriesByProject(project.id);
                  return sum + projectEntries.reduce((entrySum, entry) => entrySum + (entry.duration || 0), 0);
                }, 0) / 3600).toFixed(1)}h
              </div>
            </div>
            <div className="stat-icon">
              <Clock className="nav-icon" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-content">
          <div className="item-list" style={{ flexDirection: 'row', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="body-text"
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label-text" style={{ marginBottom: 8, display: 'block' }}>Search</label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search projects..."
                className="body-text"
                style={{
                  width: "100%",
                  height: 40,
                  border: "1px solid #3E3E50",
                  background: "#1E1E2E",
                  borderRadius: 6,
                  padding: 8,
                  color: "#F3F3F5",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="content-grid">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <div className="label-text mb-4">No projects found</div>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            return (
              <div key={project.id} className="card" style={{ overflow: 'hidden' }}>
                {/* Project Header */}
                <div className="card-header" style={{ borderBottom: '1px solid #2A2A3A' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <div className="title-medium" style={{ color: '#F3F3F5' }}>{project.name}</div>
                        <div className="label-text">{project.client}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="label-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {getStatusIcon(project.status)}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditProject(project.id)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Project Body */}
                <div className="card-content">
                  <div className="item-list" style={{ gap: 12 }}>
                    <div className="body-text" style={{ color: '#C2C2CC' }}>
                      {project.description || 'No description provided.'}
                    </div>
                    <div className="flex items-center gap-6 mt-2">
                      <div className="label-text">{stats.completedTasks} / {stats.totalTasks} Tasks Completed</div>
                      <div className="label-text">{stats.totalHours} hrs</div>
                      <div className="label-text">{stats.completionRate}% Complete</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleAddTask(project.id)}
                    >
                      + Add Task
                    </button>
                  </div>
                  {/* Tasks List */}
                  <div className="item-list mt-4" style={{ gap: 8 }}>
                    {projectTasks.length === 0 ? (
                      <div className="label-text">No tasks for this project.</div>
                    ) : (
                      projectTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <span className="label-text" style={{ minWidth: 80 }}>{task.name}</span>
                          <span className="label-text" style={{ minWidth: 80 }}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setEditingProjectId(null); }} projectId={editingProjectId || undefined} />
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} projectId={selectedProjectId || undefined} />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Projects; 