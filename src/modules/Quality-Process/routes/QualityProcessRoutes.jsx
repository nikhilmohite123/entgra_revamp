import React from 'react';
import { Routes, Route } from 'react-router-dom';

import QualityProcessHome from '../pages/QualityProcessHome';
import CustomerQualityPlaceholder from '../pages/CustomerQualityPlaceholder';
import HmpAuditPlaceholder from '../pages/HmpAuditPlaceholder';
import SupplierQualityPlaceholder from '../pages/SupplierQualityPlaceholder';

export function QualityProcessRoutes() {
  return (
    <Routes>
      <Route path="/" element={<QualityProcessHome />} />
      <Route path="customer-quality/*" element={<CustomerQualityPlaceholder />} />
      <Route path="hmp-audit/*" element={<HmpAuditPlaceholder />} />
      <Route path="supplier-quality/*" element={<SupplierQualityPlaceholder />} />
    </Routes>
  );
}
