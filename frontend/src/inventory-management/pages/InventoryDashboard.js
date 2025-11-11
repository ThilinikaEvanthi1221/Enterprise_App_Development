import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import '../styles/InventoryDashboard.css';

const InventoryDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First test if inventory routes are loaded at all
      try {
        const testResponse = await fetch('http://localhost:5000/api/inventory/test');
        const testData = await testResponse.json();
        console.log('Inventory test route response:', testData);
      } catch (testErr) {
        console.error('Inventory test route failed:', testErr);
        throw new Error('Inventory routes not loaded on backend. Please restart the backend server.');
      }
      
      const response = await inventoryApi.getDashboardData();
      console.log('Dashboard API response:', response);
      
      // Check if response has the expected structure
      if (response && response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      
      // If backend routes don't exist yet, use mock data
      if (err.response?.status === 404 || err.message?.includes('404') || err.message?.includes('not loaded')) {
        console.log('Using mock data - backend routes issue detected');
        setDashboardData({
          summary: {
            totalParts: 0,
            lowStockParts: 0,
            outOfStockParts: 0,
            inventoryValue: 0
          },
          recentTransactions: [],
          stockByCategory: []
        });
        setError(err.message || 'Backend inventory routes not accessible. Showing mock data.');
      } else {
        setError(`Failed to fetch dashboard data: ${err.message || 'Unknown error'}`);
        setDashboardData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inventory-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-dashboard">
        <div className="dashboard-header">
          <h1>Inventory Dashboard</h1>
        </div>
        <div className="info-banner" style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Inventory API Connection Issue</h3>
              <p style={{ margin: '0 0 12px 0', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #d97706' }}>
                <strong>Error:</strong> {error}
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                The inventory backend routes exist in <code>backend/inventory-management/</code> but are not accessible.
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>To fix:</strong><br/>
                1. Stop the backend server (Ctrl+C)<br/>
                2. Restart it with: <code>npm start</code> (in backend folder)<br/>
                3. Check console for: <strong>"✓ Inventory routes loaded"</strong><br/>
                4. If you see an error, check <code>backend/inventory-management/index.js</code> and model imports
              </p>
            </div>
          </div>
        </div>
        {dashboardData && (
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Total Parts</h3>
                <p className="card-number">{dashboardData.summary?.totalParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card low-stock">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>Low Stock</h3>
                <p className="card-number">{dashboardData.summary?.lowStockParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card out-of-stock">
              <div className="card-icon">🚫</div>
              <div className="card-content">
                <h3>Out of Stock</h3>
                <p className="card-number">{dashboardData.summary?.outOfStockParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card inventory-value">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Inventory Value</h3>
                <p className="card-number">LKR {(dashboardData.summary?.inventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const { summary, recentTransactions, stockByCategory } = dashboardData || {};

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Dashboard</h1>
        <button onClick={fetchDashboardData} className="refresh-btn">
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Parts</h3>
            <p className="card-number">{summary?.totalParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card low-stock">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Low Stock</h3>
            <p className="card-number">{summary?.lowStockParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card out-of-stock">
          <div className="card-icon">🚫</div>
          <div className="card-content">
            <h3>Out of Stock</h3>
            <p className="card-number">{summary?.outOfStockParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card inventory-value">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Inventory Value</h3>
            <p className="card-number">LKR {(summary?.inventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={() => window.location.href = '/employee/parts'}
            >
              <span className="action-icon">🔧</span>
              <span className="action-text">Manage Parts</span>
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => window.location.href = '/employee/stock-adjustment'}
            >
              <span className="action-icon">📦</span>
              <span className="action-text">Adjust Stock</span>
            </button>
            <button 
              className="action-btn info"
              onClick={() => window.location.href = '/employee/reports'}
            >
              <span className="action-icon">📈</span>
              <span className="action-text">View Reports</span>
            </button>
            <button 
              className="action-btn warning"
              onClick={() => window.location.href = '/employee/settings'}
            >
              <span className="action-icon">⚙️</span>
              <span className="action-text">Settings</span>
            </button>
          </div>
        </div>

        {/* Stock by Category */}
        <div className="dashboard-section">
          <h2>Stock by Category</h2>
          <div className="category-grid">
            {stockByCategory && stockByCategory.length > 0 ? (
              stockByCategory.map((category) => (
                <div key={category._id} className="category-card">
                  <h3>{category._id}</h3>
                  <div className="category-stats">
                    <div className="stat">
                      <span className="stat-label">Total Parts:</span>
                      <span className="stat-value">{category.totalParts}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Value:</span>
                      <span className="stat-value">
                        LKR {(category.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Low Stock:</span>
                      <span className={`stat-value ${category.lowStockCount > 0 ? 'warning' : ''}`}>
                        {category.lowStockCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No category data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;