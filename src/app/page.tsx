"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Upload, 
  Activity, 
  BarChart3, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download
} from 'lucide-react';

interface Metadata {
  parties?: string;
  effective_date?: string;
  governing_law?: string;
  jurisdiction?: string;
  termination_notice?: string;
  [key: string]: any;
}

interface AnalysisItem {
  clause: string;
  is_risky: boolean;
  confidence: number;
}

interface Summary {
  total_clauses: number;
  risky_clauses: number;
  safe_ratio: number;
}

interface AnalysisResult {
  filename: string;
  metadata: Metadata;
  analysis: AnalysisItem[];
  summary: Summary;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (uploadedFile: File) => {
    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.a 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            href="/" 
            className="logo"
          >
            Pippo <span style={{ color: 'var(--brand-pink)' }}>AI</span>
          </motion.a>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', gap: '20px', fontSize: '0.7rem', fontFamily: 'JetBrains Mono', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--brand-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--brand-green)' }}></div>
              <span style={{ color: 'var(--brand-green)' }}>SYSTEM ONLINE</span>
            </div>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ opacity: 0.5 }}>V2.5.0-PRO</span>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label-mono"
            >
              Bharat's Precision. Global Ambition.
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h-title"
            >
              <span style={{ color: 'var(--brand-blue)', textShadow: '0 0 40px rgba(88,166,255,0.2)' }}>Contract DNA</span><br />
              <span>Intelligence for</span><br />
              <span style={{ color: '#E91E63' }}>Legal Teams.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '40px' }}
            >
              Beyond basic trackers. Pippo AI is engineered for the deep nuances of the Indian legal landscape. 
              Upload your agreement and let our agentic engine de-risk your business in seconds. 🇮🇳
            </motion.p>

            {/* Upload Zone */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="upload-zone"
              onClick={() => !loading && fileInputRef.current?.click()}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                style={{ display: 'none' }} 
              />
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: '20px' }}
                  >
                    <Loader2 className="animate-spin" size={40} style={{ color: 'var(--brand-blue)', margin: '0 auto 20px' }} />
                    <div className="label-mono" style={{ marginBottom: '10px' }}>Sequencing Contract Nucleotides...</div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ width: '40%', height: '100%', background: 'var(--brand-blue)' }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      background: 'rgba(88,166,255,0.1)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '1px solid rgba(88,166,255,0.2)'
                    }}>
                      <Upload size={32} style={{ color: 'var(--brand-blue)' }} />
                    </div>
                    <div className="label-mono">Uplink Terminal</div>
                    <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Drag & Drop PDF or Click to Explore</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--brand-red)', marginTop: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            style={{ position: 'relative' }}
          >
            <div style={{ 
              width: '120%', 
              aspectRatio: '1', 
              background: 'radial-gradient(circle, rgba(88,166,255,0.1) 0%, transparent 70%)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: -1
            }}></div>
            <img 
              src="/contract_shield.png" 
              alt="Pippo AI Shield" 
              style={{ width: '100%', filter: 'drop-shadow(0 0 50px rgba(88,166,255,0.15))' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="container" 
            style={{ marginBottom: '100px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <Activity size={20} style={{ color: 'var(--brand-blue)' }} />
              <span className="label-mono">Analytical Report: {results.filename}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {Object.entries(results.metadata).map(([key, value], idx) => (
                <motion.div 
                  key={key} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bento-card"
                >
                  <span className="label-mono" style={{ fontSize: '0.5rem', opacity: 0.6 }}>{key.replace(/_/g, ' ')}</span>
                  <p style={{ fontWeight: 600, color: 'var(--brand-blue)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {value && value !== 'N/A' ? value : 'Not Found'}
                  </p>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '60px' }}>
              <div className="glass-container" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="stat-value">{results.summary.safe_ratio}%</div>
                  <div className="stat-label">SAFE RATIO</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--brand-green)' }} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{results.summary.total_clauses - results.summary.risky_clauses} Clean Clauses</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
                  <ShieldCheck size={160} />
                </div>
              </div>

              <div className="glass-container" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="stat-value" style={{ color: 'var(--brand-red)' }}>{results.summary.risky_clauses}</div>
                  <div className="stat-label">RISKY NODES</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--brand-red)' }} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Critical Review Required</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
                  <AlertTriangle size={160} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart3 size={20} style={{ color: 'var(--brand-blue)' }} />
                <span className="label-mono">Clause Registry Audit</span>
              </div>
              <button 
                className="label-mono" 
                style={{ 
                  background: 'rgba(88,166,255,0.1)', 
                  border: '1px solid rgba(88,166,255,0.2)', 
                  padding: '8px 16px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: 'var(--brand-blue)'
                }}
              >
                <Download size={14} /> EXPORT PDF
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.analysis.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-container" 
                  style={{ borderRadius: '16px', padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '50px', 
                        fontSize: '0.6rem', 
                        fontWeight: 800,
                        background: item.is_risky ? 'rgba(255,107,107,0.1)' : 'rgba(81,207,102,0.1)',
                        color: item.is_risky ? 'var(--brand-red)' : 'var(--brand-green)',
                        border: `1px solid ${item.is_risky ? 'rgba(255,107,107,0.2)' : 'rgba(81,207,102,0.2)'}`,
                        letterSpacing: '0.05rem'
                      }}>
                        {item.is_risky ? 'CRITICAL RISK' : 'SECURE SEGMENT'}
                      </span>
                      <span className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.4 }}>INDEX C-{i+1}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.5 }}>Confidence</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{Math.round(item.confidence * 100)}%</div>
                    </div>
                  </div>
                  <p style={{ color: '#E1E4E8', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{item.clause}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="container" style={{ padding: '80px 0 40px', borderTop: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="logo" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Pippo <span style={{ color: 'var(--brand-pink)' }}>AI</span></div>
          <p style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.05rem' }}>LEGAL TECHNOLOGY FOR THE BHARAT ERA. 🇮🇳</p>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <span className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.4, marginBottom: '10px', display: 'block' }}>RESOURCES</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', opacity: 0.6 }}>
              <a href="#">API Documentation</a>
              <a href="#">Security Audit</a>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="label-mono" style={{ fontSize: '0.55rem', opacity: 0.4, marginBottom: '10px', display: 'block' }}>TERMINAL</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 600 }}>ID: PIPPO-77-X</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </main>
  );
}
