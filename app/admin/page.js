'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = workerEmail.includes('@') 
        ? workerEmail 
        : `${workerEmail.trim().toLowerCase()}@frumencedate.internal`;

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

    } catch (err) {
      alert('Error creating worker: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard: Create Worker</h1>
      
      <form onSubmit={handleCreateWorker} className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Worker Email or Username</label>
          <input 
            type="text" 
            value={workerEmail} 
            onChange={(e) => setWorkerEmail(e.target.value)}
            placeholder="e.g. operator1"
            required
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Worker Password</label>
          <input 
            type="password" 
            value={workerPassword} 
            onChange={(e) => setWorkerPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition"
        >
          {loading ? 'Creating Worker...' : 'Create Worker Account'}
        </button>
      </form>
    </div>
  );
}
