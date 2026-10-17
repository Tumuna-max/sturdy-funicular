'use client';
import { useState } from 'react';

export default function Home() {
  const [credits, setCredits] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleBuyCredits = async (amountUsd, creditAmount) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-123',
          amountUsd,
          credits: creditAmount,
        }),
      });
      const data = await res.json();
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        alert(data.error || 'Payment initialization failed');
      }
    } catch (err) {
      alert('Error connecting to payment server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Companion Dashboard</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Chat, interact, and manage your credit balance seamlessly.</p>

        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2>Current Balance</h2>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#38bdf8', margin: '0.5rem 0' }}>
            {credits} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Credits</span>
          </p>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Top Up Credits (USDT TRC-20)</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              disabled={loading}
              onClick={() => handleBuyCredits(5, 50)}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              50 Credits ($5)
            </button>
            <button
              disabled={loading}
              onClick={() => handleBuyCredits(10, 120)}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              120 Credits ($10)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
