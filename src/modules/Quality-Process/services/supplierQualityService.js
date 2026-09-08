export const verifySupplier = async (payload, signal) => {
  // Uses fetch API with AbortController support via signal parameter
  try {
    const response = await fetch('/bpmn/ql_supplir/verify_supplier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal, // abort signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Supplier verification aborted');
    }
    throw error;
  }
};
