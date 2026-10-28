import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002';

function DashboardPage() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentForm, setPaymentForm] = useState({
    payerEmail: '',
    upiId: '',
    amount: '49.99',
    currency: 'USD',
  });
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`/api/dashboard`, {
        //const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.detail || 'Unable to load dashboard');
        }

        setUserDetails(data);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentForm((current) => ({ ...current, [name]: value }));
  };

  const handlePayPalPayment = (event) => {
    event.preventDefault();

    if (!paymentForm.payerEmail || !paymentForm.amount) {
      setPaymentMessage('Please enter both PayPal email and amount.');
      return;
    }

    setPaymentMessage(
      `Payment of ${paymentForm.amount} ${paymentForm.currency} submitted for PayPal account ${paymentForm.payerEmail}.`
    );
    setPaymentForm((current) => ({ ...current, payerEmail: '', amount: '49.99', currency: 'USD' }));
  };

  const handleUpiPayment = async (event) => {
    event.preventDefault();

    if (!paymentForm.upiId || !paymentForm.amount) {
      setPaymentMessage('Please enter both UPI ID and amount.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setPaymentMessage('Processing UPI payment...');

    try {
      const response = await fetch(`/api/payments/upi`, {
      //const response = await fetch(`${API_BASE_URL}/api/payments/upi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          upi_id: paymentForm.upiId,
          amount: paymentForm.amount,
          currency: paymentForm.currency,
          purpose: 'Training payment',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || 'UPI payment failed');
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      }

      setPaymentMessage(
        `UPI payment initiated successfully. Payment ID: ${data.payment_id || 'N/A'}. Redirecting to your UPI app...`
      );
      setPaymentForm((current) => ({ ...current, upiId: '', amount: '49.99', currency: 'USD' }));
    } catch (error) {
      setPaymentMessage(error.message || 'UPI payment failed');
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      {loading ? (
        <p>Loading current user details...</p>
      ) : error ? (
        <p className="dashboard-error">{error}</p>
      ) : (
        <>
          <h3>Current user details</h3>
          <pre className="dashboard-pre">
            {JSON.stringify(userDetails, null, 2)}
          </pre>

          <div className="dashboard-section">
            <h3>Pay by Payment Method</h3>
            <div className="dashboard-payment-card">
              <div className="dashboard-method-toggle" role="tablist" aria-label="Payment methods">
                <button
                  type="button"
                  className={`dashboard-method-button ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  PayPal
                </button>
                <button
                  type="button"
                  className={`dashboard-method-button ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
              </div>

              {paymentMethod === 'paypal' ? (
                <form className="dashboard-payment-form" onSubmit={handlePayPalPayment}>
                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="payerEmail">PayPal Email</label>
                    <input
                      id="payerEmail"
                      name="payerEmail"
                      type="email"
                      className="dashboard-input"
                      value={paymentForm.payerEmail}
                      onChange={handlePaymentChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="amount">Amount</label>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      className="dashboard-input"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      className="dashboard-input"
                      value={paymentForm.currency}
                      onChange={handlePaymentChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <button type="submit" className="dashboard-submit-button">
                    Pay with PayPal
                  </button>
                </form>
              ) : (
                <form className="dashboard-payment-form" onSubmit={handleUpiPayment}>
                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="upiId">UPI ID</label>
                    <input
                      id="upiId"
                      name="upiId"
                      type="text"
                      className="dashboard-input"
                      value={paymentForm.upiId}
                      onChange={handlePaymentChange}
                      placeholder="username@upi"
                      required
                    />
                  </div>

                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="amount-upi">Amount</label>
                    <input
                      id="amount-upi"
                      name="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      className="dashboard-input"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="dashboard-payment-row">
                    <label className="dashboard-label" htmlFor="currency-upi">Currency</label>
                    <select
                      id="currency-upi"
                      name="currency"
                      className="dashboard-input"
                      value={paymentForm.currency}
                      onChange={handlePaymentChange}
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <button type="submit" className="dashboard-submit-button upl-button">
                    Pay with UPI
                  </button>
                </form>
              )}

              {paymentMessage && (
                <p className="dashboard-success">{paymentMessage}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
