import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Results() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await API.get(`/analyze/${documentId}`);
      setAnalysis(res.data);
    } catch (err) {
      setError('Could not load analysis results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.center}>
      <p>Loading results...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: '#dc2626' }}>{error}</p>
      <button style={styles.btn} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Medical Translator</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div style={styles.body}>

        {/* Urgent Flags */}
        {analysis.urgentFlags && analysis.urgentFlags.length > 0 && (
          <div style={styles.urgentCard}>
            <h2 style={styles.urgentTitle}>⚠️ Urgent Warnings</h2>
            {analysis.urgentFlags.map((flag, i) => (
              <p key={i} style={styles.urgentItem}>• {flag}</p>
            ))}
          </div>
        )}

        {/* Summary */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Summary</h2>
          <p style={styles.summaryText}>{analysis.summary}</p>
        </div>

        {/* Medications */}
        {analysis.medications && analysis.medications.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💊 Medications</h2>
            {analysis.medications.map((med, i) => (
              <div key={i} style={styles.medCard}>
                <p style={styles.medName}>{med.name}</p>
                <div style={styles.medDetails}>
                  <span style={styles.medPill}>Dose: {med.dose}</span>
                  <span style={styles.medPill}>Frequency: {med.frequency}</span>
                </div>
                <p style={styles.medPurpose}>{med.purpose}</p>
              </div>
            ))}
          </div>
        )}

        {/* Medical Terms */}
        {analysis.terms && analysis.terms.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📖 Medical Terms Explained</h2>
            {analysis.terms.map((term, i) => (
              <div key={i} style={styles.termRow}>
                <p style={styles.termName}>{term.term}</p>
                <p style={styles.termDef}>{term.definition}</p>
              </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {analysis.nextSteps && analysis.nextSteps.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>✅ Next Steps</h2>
            {analysis.nextSteps.map((step, i) => (
              <p key={i} style={styles.nextStep}>• {step}</p>
            ))}
          </div>
        )}

        <p style={styles.disclaimer}>
          ⚕️ This is an AI-generated explanation for informational purposes only.
          Always consult your doctor for medical advice.
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  center: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  header: { backgroundColor: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  headerTitle: { fontSize: '20px', fontWeight: '600', color: '#4f46e5' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f4f8', color: '#444', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  body: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px' },
  urgentCard: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  urgentTitle: { fontSize: '18px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' },
  urgentItem: { fontSize: '15px', color: '#b91c1c', marginBottom: '6px', lineHeight: '1.6' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px' },
  summaryText: { fontSize: '15px', color: '#444', lineHeight: '1.8' },
  medCard: { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  medName: { fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' },
  medDetails: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' },
  medPill: { backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  medPurpose: { fontSize: '14px', color: '#666', lineHeight: '1.6' },
  termRow: { borderBottom: '1px solid #f0f4f8', paddingBottom: '12px', marginBottom: '12px' },
  termName: { fontSize: '15px', fontWeight: '600', color: '#4f46e5', marginBottom: '4px' },
  termDef: { fontSize: '14px', color: '#666', lineHeight: '1.6' },
  nextStep: { fontSize: '15px', color: '#444', marginBottom: '8px', lineHeight: '1.6' },
  disclaimer: { fontSize: '13px', color: '#999', textAlign: 'center', marginTop: '24px', lineHeight: '1.6' },
  btn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

export default Results;