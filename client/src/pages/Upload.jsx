import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selected.type)) {
      setError('Only PDF, JPG and PNG files are allowed');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('document', file);

      await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload Medical Document</h2>
        <p style={styles.subtitle}>PDF, JPG or PNG — max 10MB</p>

        {error && <p style={styles.error}>{error}</p>}

        <div
          style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}) }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {file ? (
            <div>
              <p style={styles.fileName}>{file.name}</p>
              <p style={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={styles.dropText}>Drag and drop your file here</p>
              <p style={styles.dropSubText}>or click to browse</p>
            </div>
          )}
        </div>

        <input
          id="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          style={!file || uploading ? styles.buttonDisabled : styles.button}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>

        <button
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { fontSize: '24px', fontWeight: '600', marginBottom: '4px', color: '#1a1a2e' },
  subtitle: { color: '#666', marginBottom: '28px', fontSize: '14px' },
  dropzone: { border: '2px dashed #ddd', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px' },
  dropzoneActive: { border: '2px dashed #4f46e5', backgroundColor: '#f5f3ff' },
  dropText: { fontSize: '16px', color: '#444', marginBottom: '8px' },
  dropSubText: { fontSize: '14px', color: '#999' },
  fileName: { fontSize: '15px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' },
  fileSize: { fontSize: '13px', color: '#666' },
  button: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' },
  buttonDisabled: { width: '100%', padding: '12px', backgroundColor: '#a5b4fc', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'not-allowed', marginBottom: '12px' },
  backButton: { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
};

export default Upload;