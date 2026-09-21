import React from 'react';
import ProjectForm from './components/ProjectForm';

export default function CreateProjectPage() {
  return (
    <div className="row" id="hideDiv">
      {/* 
        Intentionally keeping inactivity timer out of this component, 
        leaving it UNKNOWN — REQUIRES REVIEW for application/session layer implementation later.
      */}
      <ProjectForm />
    </div>
  );
}
