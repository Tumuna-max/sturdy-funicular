'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount, credits) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, credits }),
      });

      const data = await res.json();

      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        alert(data.error || 'Failed to create payment invoice. Please try again.');
      }
    } catch (err) {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          AI Companion Dashboard
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          Chat, interact, and manage your credit balance seamlessly.
        </p>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
            Current Balance
          </h2>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold' }}>50</span>
            <span style={{ fontSize: '18px', color: '#94a3b8' }}>Credits</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Top Up Credits (USDT TRC-20)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => handlePayment(5, 50)}
              disabled={loading}
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {loading ? 'Processing...' : '50 Credits ($5)'}
            </button>
            <button
              onClick={() => handlePayment(10, 120)}
              disabled={loading}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #334155',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {loading ? 'Processing...' : '120 Credits ($10)'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
