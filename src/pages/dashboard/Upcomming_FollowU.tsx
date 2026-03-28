import {
  Building2,
  LayoutGrid,
  Mail,
  Phone,
  User
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/Store";
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";

const Upcomming_FollowU = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { upcomingFollowUps, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Safely extract leads array
  const upcomingFollowUpsData = upcomingFollowUps?.data?.upcomingFollowUps || [];
  const leadsArray = Array.isArray(upcomingFollowUpsData) ? upcomingFollowUpsData : [];

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Helper function to handle status colors safely
  const getStatusStyles = (leadstatus: any) => {
    const defaultColor = "#64748b"; // Default Gray
    const apiColor = leadstatus?.color;
    
    // Check if color exists and is a valid hex (starts with #)
    const finalColor = (apiColor && apiColor.startsWith('#')) ? apiColor : defaultColor;
    
    return {
      backgroundColor: `${finalColor}15`, // 15 is 8% opacity in hex alpha
      color: finalColor,
      border: `1px solid ${finalColor}40` // 40 is 25% opacity
    };
  };

  if (isLoading) return <div className="loading">Loading leads...</div>;

  return (
    <div className="leads-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="header-left">
          <div className="grid-icon">
            <LayoutGrid size={16} color="#94a3b8" strokeWidth={3} />
          </div>
          <h2 className="header-title">Recent Leads</h2>
        </div>
        <button className="view-all">View All</button>
      </div>

      {/* Table Container with Fixed Height & Scroll */}
      <div className="table-responsive">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Lead Soruce</th>
            </tr>
          </thead>
          <tbody>
            {leadsArray.map((lead: any) => {
              // Get safe styles for this specific row's status
              const statusStyle = getStatusStyles(lead.leadstatus);
              
              return (
                <tr key={lead._id}>
                  {/* Lead Column */}
                  <td>
                    <div className="lead-cell">
                      <div className="icon-bg">
                        <User size={18} color="#64748b" />
                      </div>
                      <div className="lead-info">
                        <span className="lead-name">{lead.manualData?.name || "N/A"}</span>
                        <div className="lead-sub">
                          <Building2 size={12} />
                          <span>{lead.manualData?.jobTitle || lead.manualData?.website || lead.LeadId}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Mail size={14} color="#64748b" />
                        <span>{lead.manualData?.email || "N/A"}</span>
                      </div>
                      <div className="contact-item">
                        <Phone size={14} color="#64748b" />
                        <span>{lead.manualData?.mobileNo || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Column - FIXED LOGIC */}
                  <td>
                    <span 
                      className="status-badge"
                      style={statusStyle}
                    >
                      {/* Displays statusName if exists, otherwise tries to find 'status' string, else defaults to 'New' */}
                      {lead.leadstatus?.statusName || lead.leadstatus?.status || "New"}
                    </span>
                  </td>

                  {/* Lead Source Column */}
                  <td>
                    <span className="source-text">{lead.leadsource || "Offline"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leadsArray.length === 0 && <div className="no-data">No recent leads found</div>}
      </div>

      <style>{`
        .leads-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          width: 100%;
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .grid-icon {
          background: #f1f5f9;
          padding: 6px;
          border-radius: 50%;
          display: flex;
        }

        .header-title {
          font-size: 18px;
          font-weight: 700;
          color: #05264e;
          margin: 0;
        }

        .view-all {
          background: none;
          border: none;
          color: #05264e;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
        }

        .table-responsive {
          width: 100%;
          max-height: 450px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .table-responsive::-webkit-scrollbar {
          width: 6px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .leads-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .leads-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
          background-color: #ffffff;
        }

        .leads-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .lead-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-bg {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
        }

        .lead-info {
          display: flex;
          flex-direction: column;
        }

        .lead-name {
          color: #0056b3;
          font-weight: 600;
          font-size: 14px;
        }

        .lead-sub {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-size: 12px;
          margin-top: 2px;
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #0056b3;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          min-width: 65px;
          text-align: center;
          text-transform: capitalize;
        }

        .source-text {
          color: #05264e;
          font-size: 14px;
        }

        .no-data {
            padding: 30px;
            text-align: center;
            color: #94a3b8;
        }

        .loading {
          padding: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Upcomming_FollowU;