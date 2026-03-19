import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FiTrash2 } from 'react-icons/fi';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await API.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await API.delete(`/documents/${docId}`);
      setDocuments(docs => docs.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'complete': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#666';
    }
  };

  const formatSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Medical Translator</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>Hello, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.topRow}>
          <h2 style={styles.sectionTitle}>Your Documents</h2>
          <button
            style={styles.uploadBtn}
            onClick={() => navigate('/upload')}
          >
            + Upload New
          </button>
        </div>

        {loading ? (
          <p style={styles.emptyText}>Loading...</p>
        ) : documents.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No documents uploaded yet.</p>
            <p style={styles.emptySub}>
              Upload a medical document to get started.
            </p>
            <button
              style={styles.uploadBtnLarge}
              onClick={() => navigate('/upload')}
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div style={styles.docList}>
            {documents.map((doc) => (
              <div key={doc._id} style={styles.docCard}>
                <div style={styles.docIcon}>
                  {doc.mimeType === 'application/pdf' ? '📄' : '🖼️'}
                </div>
                <div style={styles.docInfo}>
                  <p style={styles.docName}>{doc.originalFilename}</p>
                  <p style={styles.docMeta}>
                    {formatSize(doc.size)} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div style={styles.docActions}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(doc.status) + '20',
                    color: getStatusColor(doc.status)
                  }}>
                    {doc.status}
                  </span>
                  {doc.status === 'complete' ? (
                    <button
                      style={styles.viewBtn}
                      onClick={() => navigate(`/results/${doc._id}`)}
                    >
                      View Results
                    </button>
                  ) : (
                    <button
                      style={styles.analyzeBtn}
                      onClick={() => navigate(`/analyze/${doc._id}`)}
                    >
                      Analyze
                    </button>
                  )}
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(doc._id)}
                    title="Delete document"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  title: { fontSize: '20px', fontWeight: '600', color: '#4f46e5' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { fontSize: '14px', color: '#333' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  body: { padding: '32px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '22px', fontWeight: '600', color: '#1a1a2e' },
  uploadBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  emptyCard: { backgroundColor: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  emptyText: { fontSize: '16px', color: '#444', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: '#999', marginBottom: '24px' },
  uploadBtnLarge: { padding: '14px 32px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
  docList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  docCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  docIcon: { fontSize: '32px' },
  docInfo: { flex: 1 },
  docName: { fontSize: '15px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' },
  docMeta: { fontSize: '13px', color: '#999' },
  docActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  analyzeBtn: { padding: '8px 18px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  viewBtn: { padding: '8px 18px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  deleteBtn: { padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default Dashboard;