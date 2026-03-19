import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Analyze() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      setStatus('processing');
      await API.post(`/analyze/${documentId}`);
      setStatus('complete');
      setTimeout(() => navigate(`/results/${documentId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
      setStatus('failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'processing' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Analyzing your document...</h2>
            <p style={styles.sub}>
              Claude AI is reading and explaining your medical document.
              This takes about 15-30 seconds.
            </p>
            <div style={styles.steps}>
              <p style={styles.step}>✅ Document uploaded</p>
              <p style={styles.step}>⏳ Extracting text...</p>
              <p style={styles.step}>🤖 Asking AI for analysis to explain...</p>
              <p style={styles.step}>💾 Saving results...</p>
            </div>
          </>
        )}

        {status === 'complete' && (
          <>
            <p style={styles.successIcon}>✅</p>
            <h2 style={styles.title}>Analysis Complete!</h2>
            <p style={styles.sub}>Redirecting to your results...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <p style={styles.errorIcon}>❌</p>
            <h2 style={styles.title}>Analysis Failed</h2>
            <p style={styles.error}>{error}</p>
            <button
              style={styles.button}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
  card: { backgroundColor: 'white', padding: '48px 40px', borderRadius: '12px', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  spinner: { width: '48px', height: '48px', border: '4px solid #e0e7ff', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' },
  title: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', marginBottom: '12px' },
  sub: { fontSize: '14px', color: '#666', marginBottom: '28px', lineHeight: '1.6' },
  steps: { textAlign: 'left', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px' },
  step: { fontSize: '14px', color: '#444', marginBottom: '8px', lineHeight: '1.6' },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  errorIcon: { fontSize: '48px', marginBottom: '16px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' },
  button: { padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
};

export default Analyze;