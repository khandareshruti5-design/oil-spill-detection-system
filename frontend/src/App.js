import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet default marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [file, setFile] = useState(null);
  const [windSpeed, setWindSpeed] = useState(12);
  const [windDirection, setWindDirection] = useState(142);
  const [elapsedHours, setElapsedHours] = useState(4);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPipeline = async () => {
    if (!file) return alert("Please select a SAR image!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("wind_speed_knots", windSpeed);
    formData.append("wind_direction_deg", windDirection);
    formData.append("elapsed_hours", elapsedHours);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/analyze", formData);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Error processing pipeline. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const riskAssessment = results?.risk_assessment || {};
  const spillData = results?.spill_detection || {};
  const vessels = results?.candidate_vessels || [];

  // Default coordinates (Mumbai Coast/Alibaug Area)
  const defaultCenter = [18.9218, 72.8347];
  const spillCenter = spillData.spill_center || defaultCenter;
  const bdtoeOrigin = spillData.bdtoe_origin || [18.9028, 72.8503];

  // Trajectory Line
  const trajectoryPolyline = [spillCenter, bdtoeOrigin];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Sentinel-AIS Oil Spill Detection Engine</h1>
        <span style={styles.statusBadge}>System Online</span>
      </header>

      <div style={styles.layout}>
        {/* Sidebar Controls */}
        <div style={styles.sidebar}>
          <h3 style={styles.sectionTitle}>1. Analysis Parameters</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>SAR Image File</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Wind Speed: <strong>{windSpeed} knots</strong></label>
            <input type="range" min="0" max="50" value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} style={styles.slider} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Wind Direction: <strong>{windDirection}°</strong></label>
            <input type="range" min="0" max="360" value={windDirection} onChange={(e) => setWindDirection(e.target.value)} style={styles.slider} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Drift Time: <strong>{elapsedHours} hrs</strong></label>
            <input type="range" min="1" max="24" value={elapsedHours} onChange={(e) => setElapsedHours(e.target.value)} style={styles.slider} />
          </div>

          <button onClick={runPipeline} disabled={loading} style={styles.button}>
            {loading ? "Analyzing Pipeline..." : "Run Pipeline Analysis"}
          </button>
        </div>

        {/* Main Content Area */}
        <div style={styles.content}>
          {!results ? (
            <div style={styles.placeholderCard}>
              <h3>No Analysis Loaded</h3>
              <p>Upload a SAR image from the control panel and click <strong>Run Pipeline Analysis</strong> to generate spill metrics and interactive map.</p>
            </div>
          ) : (
            <div style={styles.resultsGrid}>
              {/* Risk Banner */}
              <div style={styles.riskCard}>
                <h3 style={{ margin: '0 0 10px 0', color: '#b91c1c' }}>Risk Assessment</h3>
                <div style={styles.metricsRow}>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Risk Level</span>
                    <span style={styles.criticalBadge}>{riskAssessment.risk_level || "CRITICAL"}</span>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Risk Score</span>
                    <span style={styles.metricValue}>{riskAssessment.risk_score || "89.5"}/100</span>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>High Risk Zone</span>
                    <span style={styles.metricValueText}>{riskAssessment.high_risk_zone || "Zone A"}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Map Section */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Live Geospatial Tracking (Leaflet Map)</h3>
                <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer center={spillCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Spill Center Marker */}
                    <Marker position={spillCenter}>
                      <Popup>
                        <strong>Oil Spill Detected Center</strong><br />
                        Area: {spillData.area_sq_km || "12.4"} sq km
                      </Popup>
                    </Marker>

                    {/* BDTOE Origin Marker */}
                    <Marker position={bdtoeOrigin}>
                      <Popup>
                        <strong>Calculated BDTOE Origin</strong><br />
                        Suspected Dumping Point
                      </Popup>
                    </Marker>

                    {/* Back-drift trajectory line */}
                    <Polyline positions={trajectoryPolyline} color="red" dashArray="5, 10" />
                  </MapContainer>
                </div>
              </div>

              {/* Suspect Vessels */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Attributed AIS Suspect Vessels</h3>
                {vessels.length > 0 ? (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Vessel Name</th>
                        <th style={styles.th}>MMSI</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Distance</th>
                        <th style={styles.th}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vessels.map((v, i) => (
                        <tr key={i}>
                          <td style={styles.td}><strong>{v.vessel_name}</strong></td>
                          <td style={styles.td}>{v.mmsi}</td>
                          <td style={styles.td}>{v.vessel_type}</td>
                          <td style={styles.td}>{v.distance_km} km</td>
                          <td style={styles.td}><span style={styles.scoreBadge}>{v.score}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No high-scoring candidate vessels detected nearby.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Dashboard Styles
const styles = {
  container: { backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { backgroundColor: '#0f172a', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '20px', fontWeight: '600' },
  statusBadge: { backgroundColor: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  layout: { display: 'flex', gap: '20px', padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  sidebar: { width: '320px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '16px', color: '#334155' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' },
  fileInput: { width: '100%', fontSize: '13px' },
  slider: { width: '100%' },
  button: { width: '100%', backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  content: { flex: 1 },
  placeholderCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#64748b' },
  resultsGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  riskCard: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '20px', borderRadius: '8px' },
  metricsRow: { display: 'flex', gap: '20px' },
  metricBox: { flex: 1, backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #fee2e2' },
  metricLabel: { display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  criticalBadge: { color: '#dc2626', fontWeight: 'bold', fontSize: '18px' },
  metricValue: { fontSize: '20px', fontWeight: 'bold', color: '#0f172a' },
  metricValueText: { fontSize: '14px', fontWeight: '600', color: '#334155' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: '8px', color: '#475569' },
  td: { borderBottom: '1px solid #f1f5f9', padding: '10px 8px' },
  scoreBadge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }
};

export default App;