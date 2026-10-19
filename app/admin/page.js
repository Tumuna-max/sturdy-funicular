const handleCreateWorker = async (e) => {
  e.preventDefault();

  try {
    // 1. Format a clean, valid email that Supabase accepts without rate limits
    const cleanEmail = workerEmail.includes('@') 
      ? workerEmail 
      : `${workerEmail.trim().toLowerCase()}@frumencedate.internal`;

    // 2. Call your backend API route or Supabase Admin creation method
    const response = await fetch('/api/admin/create-worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: cleanEmail, 
        password: workerPassword,
        role: 'worker',
        operator_slots: 20 
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create worker');
    }

    alert(`Worker successfully created!\nEmail: ${cleanEmail}`);
    setWorkerEmail('');
    setWorkerPassword('');
    fetchData(); // Refresh the worker list

  } catch (err) {
    alert('Error creating worker: ' + err.message);
  }
};
