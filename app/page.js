'use client';
import { useState } from 'react';

export default function Home() {
  const [balance, setBalance] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (amount, credits) => {
    setLoading(true);
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, credits }),
      });

      const data = await response.json();

      if (data.invoice_url) {
        // Redirect user to NOWPayments checkout page
        window.location.href = data.invoice_url;
      } else {
        alert('Failed to create payment invoice. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred starting the payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>AI Companion Dashboard</h1>
      <p>Chat, interact, and manage your credit balance seamlessly.</p>

      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>Current Balance</h2>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          {balance} <span style={{ fontSize: '1rem' }}>Credits</span>
        </p>
      </div>

      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', maxWidth: '400px' }}>
        <h3>Top Up Credits (USDT TRC-20)</h3>
        <button
          onClick={() => handleTopUp(5, 50)}
          disabled={loading}
          style={{ margin: '0.5rem', padding: '0.75rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : '50 Credits ($5)'}
        </button>
        <button
          onClick={() => handleTopUp(10, 120)}
          disabled={loading}
          style={{ margin: '0.5rem', padding: '0.75rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : '120 Credits ($10)'}
        </button>
      </div>
    </main>
  );
}
