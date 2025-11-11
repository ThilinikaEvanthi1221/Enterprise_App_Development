import React, { useState, useEffect, useCallback } from 'react';
import inventoryApi from '../services/inventoryApi';
import '../styles/Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'summary', name: 'Inventory Summary', icon: '📊' },
    { id: 'lowStock', name: 'Low Stock Report', icon: '⚠️' },
    { id: 'transactions', name: 'Transaction History', icon: '📋' },
    { id: 'categoryWise', name: 'Category Analysis', icon: '📦' },
    { id: 'valueReport', name: 'Inventory Value', icon: '💰' }
  ];

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      switch (activeReport) {
        case 'summary':
          response = await inventoryApi.getInventorySummary();
          break;
        case 'lowStock':
          response = await inventoryApi.getLowStockReport();
          break;
        case 'transactions':
          response = await inventoryApi.getTransactionHistory({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          break;
        case 'categoryWise':
          response = await inventoryApi.getCategoryAnalysis();
          break;
        case 'valueReport':
          response = await inventoryApi.getInventoryValue();
          break;
        default:
          response = await inventoryApi.getInventorySummary();
      }
      
      setReportData(response.data || response);
      setError('');
    } catch (err) {
      console.error('Report fetch error:', err);
      
      // Check if it's a 404 (route not found) or other error
      if (err.response?.status === 404 || err.message?.includes('404')) {
        console.log('404 error - Route may not exist or data not found');
        const mockData = {
          totalParts: 0,
          lowStockParts: 0,
          outOfStockParts: 0,
          inventoryValue: 0,
          parts: [],
          transactions: [],
          categories: []
        };
        setReportData(mockData);
        setError('Backend route returned 404. This may mean the database has no inventory data yet.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Please ensure the backend is running on port 5000.');
        setReportData(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication/Permission error. Please log in again or check your permissions.');
        setReportData(null);
      } else {
        setError(`Failed to fetch report data: ${err.message || 'Unknown error'}`);
        setReportData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = (format) => {
    if (!reportData) return;
    
    // Simple CSV export for now
    if (format === 'csv') {
      let csvContent = '';
      
      if (activeReport === 'transactions' && reportData.transactions) {
        csvContent = 'Date,Part Number,Part Name,Type,Quantity,Performed By\n';
        reportData.transactions.forEach(transaction => {
          csvContent += `${new Date(transaction.createdAt).toLocaleDateString()},${transaction.part?.partNumber || 'N/A'},${transaction.part?.name || 'N/A'},${transaction.transactionType},${transaction.quantity},${transaction.performedBy?.name || 'System'}\n`;
        });
      } else if (activeReport === 'lowStock' && reportData.parts) {
        csvContent = 'Part Number,Name,Current Stock,Min Stock,Category,Supplier\n';
        reportData.parts.forEach(part => {
          csvContent += `${part.partNumber},${part.name},${part.currentStock},${part.minStockLevel},${part.category},${part.supplier || 'N/A'}\n`;
        });
      }
      
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const renderSummaryReport = () => (
    <div className="report-content">
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.totalParts || 0}</div>
            <div className="stat-label">Total Parts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.lowStockParts || 0}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.outOfStockParts || 0}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">LKR {(reportData?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
      </div>
      
      {reportData?.categoryBreakdown && (
        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          <div className="category-list">
            {reportData.categoryBreakdown.map((category) => (
              <div key={category._id} className="category-item">
                <div className="category-name">{category._id}</div>
                <div className="category-stats">
                  <span>Parts: {category.count}</span>
                  <span>Value: LKR {(category.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLowStockReport = () => (
    <div className="report-content">
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.parts?.map((part) => (
              <tr key={part._id}>
                <td>{part.partNumber}</td>
                <td>{part.name}</td>
                <td>{part.category}</td>
                <td className={part.currentStock === 0 ? 'out-of-stock' : 'low-stock'}>
                  {part.currentStock}
                </td>
                <td>{part.minStockLevel}</td>
                <td>
                  <span className={`status ${part.currentStock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                    {part.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
                <td>{part.supplier || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!reportData?.parts || reportData.parts.length === 0) && (
          <div className="no-data">No low stock items found</div>
        )}
      </div>
    </div>
  );

  const renderTransactionReport = () => (
    <div className="report-content">
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Part Number</th>
              <th>Part Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Performed By</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.transactions?.map((transaction) => (
              <tr key={transaction._id}>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.part?.partNumber || 'N/A'}</td>
                <td>{transaction.part?.name || 'N/A'}</td>
                <td>
                  <span className={`transaction-type ${transaction.transactionType.toLowerCase()}`}>
                    {transaction.transactionType}
                  </span>
                </td>
                <td>{transaction.quantity}</td>
                <td>{transaction.performedBy?.name || 'System'}</td>
                <td>{transaction.reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!reportData?.transactions || reportData.transactions.length === 0) && (
          <div className="no-data">No transactions found for the selected date range</div>
        )}
      </div>
    </div>
  );

  const renderCategoryReport = () => (
    <div className="report-content">
      <div className="summary-stats">
        {reportData?.categories?.map((category) => (
          <div key={category._id} className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-label">{category._id}</div>
              <div className="stat-value">{category.totalParts || 0} parts</div>
              <div className="stat-sub">LKR {(category.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        ))}
        {(!reportData?.categories || reportData.categories.length === 0) && (
          <div className="no-data">No category data available</div>
        )}
      </div>
    </div>
  );

  const renderValueReport = () => (
    <div className="report-content">
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.summary?.totalParts || 0}</div>
            <div className="stat-label">Total Parts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.summary?.totalStockQuantity || 0}</div>
            <div className="stat-label">Total Stock Quantity</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">LKR {(reportData?.summary?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Inventory Value</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">LKR {(reportData?.summary?.averagePartValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-label">Avg Part Value</div>
          </div>
        </div>
      </div>

      {reportData?.topValueParts && reportData.topValueParts.length > 0 && (
        <div className="report-table" style={{ marginTop: '20px' }}>
          <h3>Top 10 Most Valuable Parts</h3>
          <table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topValueParts.map((part) => (
                <tr key={part._id}>
                  <td>{part.partNumber}</td>
                  <td>{part.name}</td>
                  <td>{part.category}</td>
                  <td>{part.currentStock}</td>
                  <td>LKR {(part.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>LKR {(part.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportData?.categoryValues && reportData.categoryValues.length > 0 && (
        <div className="report-table" style={{ marginTop: '20px' }}>
          <h3>Value by Category</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Part Count</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData.categoryValues.map((category) => (
                <tr key={category._id}>
                  <td>{category._id}</td>
                  <td>{category.partCount}</td>
                  <td>LKR {(category.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReportContent = () => {
    if (loading) {
      return <div className="loading">Loading report data...</div>;
    }

    if (error) {
      return (
        <div className="info-banner" style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Report Data Error</h3>
              <p style={{ margin: '0 0 12px 0', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #d97706' }}>
                <strong>Error:</strong> {error}
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                The inventory backend API is running, but this report could not be loaded.
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>Possible causes:</strong><br/>
                • Database has no inventory data yet (showing zeros is normal)<br/>
                • Network connection issue<br/>
                • Authentication/permission issue<br/>
                <br/>
                <strong>Try:</strong> Refresh the page (F5) or add some inventory parts first.
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (activeReport) {
      case 'summary':
        return renderSummaryReport();
      case 'lowStock':
        return renderLowStockReport();
      case 'transactions':
        return renderTransactionReport();
      case 'categoryWise':
        return renderCategoryReport();
      case 'valueReport':
        return renderValueReport();
      default:
        return <div className="no-data">Report type not implemented yet</div>;
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📊 Inventory Reports</h1>
        <div className="header-actions">
          <button 
            className="export-btn"
            onClick={() => exportReport('csv')}
            disabled={!reportData || loading}
          >
            📥 Export CSV
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchReportData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <h3>Report Types</h3>
          <div className="report-types">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                className={`report-type-btn ${activeReport === report.id ? 'active' : ''}`}
                onClick={() => setActiveReport(report.id)}
              >
                <span className="report-icon">{report.icon}</span>
                <span className="report-name">{report.name}</span>
              </button>
            ))}
          </div>

          {(activeReport === 'transactions') && (
            <div className="date-filters">
              <h4>Date Range</h4>
              <div className="date-inputs">
                <label>
                  From:
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  />
                </label>
                <label>
                  To:
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="reports-main">
          <div className="report-header">
            <h2>
              {reportTypes.find(r => r.id === activeReport)?.icon} {' '}
              {reportTypes.find(r => r.id === activeReport)?.name}
            </h2>
            {activeReport === 'transactions' && (
              <div className="date-range-display">
                {dateRange.startDate} to {dateRange.endDate}
              </div>
            )}
          </div>

          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;