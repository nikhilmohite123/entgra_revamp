export const verifySupplier = async (payload, signal) => {
  try {
    const response = await fetch('/bpmn/ql_supplir/verify_supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') console.log('Supplier verification aborted');
    throw error;
  }
};

// Master Data APIs
export const getLocations = async (signal) => {
  const res = await fetch('/bpmn/global/getlocation', { signal });
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
};

export const getSupplierCategories = async (signal) => {
  const res = await fetch('/bpmn/ql_supplir/getSupplr_cat', { signal });
  if (!res.ok) throw new Error('Failed to fetch supplier categories');
  return res.json();
};

export const getCurrencyUom = async (signal) => {
  const res = await fetch('/bpmn/ql_supplir/get_currancy_uom', {
    method: 'POST',
    signal,
  });
  if (!res.ok) throw new Error('Failed to fetch currency and UOM');
  return res.json();
};

// Dynamic Cascading Dropdown APIs
export const getDefectTypes = async (categoryId, signal) => {
  const formData = new URLSearchParams();
  formData.append('cat', categoryId);

  const res = await fetch('/bpmn/ql_supplir/getDefect_typ', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    signal,
  });
  if (!res.ok) throw new Error('Failed to fetch defect types');
  return res.json();
};

export const getNatureOfDefect = async (defectTypeId, signal) => {
  const formData = new URLSearchParams();
  formData.append('natur_defect', defectTypeId);

  const res = await fetch('/bpmn/ql_supplir/getNatur_defect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    signal,
  });
  if (!res.ok) throw new Error('Failed to fetch nature of defect');
  return res.json();
};

// Complaint CRUD & Flow APIs
export const getComplaintById = async (id, signal) => {
  const formData = new URLSearchParams();
  formData.append('noti_id', id);

  const res = await fetch('/bpmn/ql_supplir/getdataByID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    signal,
  });
  if (!res.ok) throw new Error('Failed to fetch complaint details');
  return res.json();
};

export const saveComplaint = async (payload, signal) => {
  const res = await fetch('/bpmn/ql_supplir/save_data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error('Failed to save complaint');
  return res.json();
};

// File Uploads
export const uploadComplaintFile = async (formData, signal) => {
  const res = await fetch('/bpmn/supplir_File_upload', {
    method: 'POST',
    body: formData, // Auto sets multipart/form-data with boundary
    signal,
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
};

export const deleteComplaintFile = async (payload, signal) => {
  const res = await fetch('/bpmn/ql_supplir/deletesRaisecomplaintImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
    signal,
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return res.json(); // Expected format varies depending on endpoint structure
};
