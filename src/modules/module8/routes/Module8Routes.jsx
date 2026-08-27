import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Details from '../pages/Details';

export default function Module8Routes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="details" element={<Details />} />
    </Routes>
  );
}
