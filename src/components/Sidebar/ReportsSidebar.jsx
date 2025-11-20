import React, { useEffect, useState } from 'react';
import { fetchData } from '../../services/api';

const ReportsSidebar = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        // Previously data fetching was disabled, now enabling it
        const data = await fetchData('/api/reports');
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    // Enable data fetching which was previously disabled
    loadReports();
  }, []);

  return (
    <div className="reports-sidebar">
      <h3>Reports</h3>
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <ul>
          {reports.map(report => (
            <li key={report.id}>{report.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsSidebar;