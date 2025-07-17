"use client";

import React, { ReactNode } from 'react';
import { useLayout } from '../../contexts/LayoutContext';

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div 
      className="main-content"
      style={{
        marginLeft: isSidebarCollapsed ? '64px' : '256px',
        transition: 'margin-left 0.3s ease'
      }}
    >
      {children}
    </div>
  );
};

export default MainContent; 