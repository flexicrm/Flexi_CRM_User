import {
  Building2,
  Mail,
  Phone
} from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";
import type { AppDispatch, RootState } from "../../store/Store";

const High_Leads = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { highValueLeads, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Safely extract data
  const leads = highValueLeads?.data?.highValueLeads || [];

  if (isLoading) return <div className="p-6 text-center text-slate-500">Loading...</div>;

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      {/* Card Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h2 className="text-[19px] font-bold text-[#05264e]">High Value Leads</h2>
        </div>
        <button className="text-sm font-medium text-[#05264e] hover:underline">
          View All
        </button>
      </div>

      {/* Leads List */}
      <div className="flex flex-col">
        {leads.length > 0 ? (
          leads.map((lead: any, index: number) => (
            <div 
              key={lead._id} 
              // Added subtle background to the second item to match the image precisely
              className={`p-5 flex flex-col gap-1 transition-colors border-b border-gray-50 last:border-0 ${
                index === 1 ? "bg-gray-50/50" : "hover:bg-gray-50/30"
              }`}
            >
              {/* Row 1: Name and Priority */}
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-[#05264e] capitalize">
                  {lead.leadName}
                </h3>
                <span className={`px-4 py-1 rounded-md text-sm font-semibold capitalize bg-[#2e7d32] text-white`}>
                  {lead.priority}
                </span>
              </div>

              {/* Row 2: Company */}
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 size={14} className="shrink-0" />
                <span className="text-sm">
                  {lead.leadCompany || "-"}
                </span>
              </div>

              {/* Row 3: Contact Info (Email and Mobile) */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={14} className="shrink-0 text-[#05264e]" />
                  <span className="text-sm truncate max-w-[180px] sm:max-w-none">
                    {lead.leadEmail}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone size={14} className="shrink-0" />
                  <span className="text-sm font-medium">
                    {lead.leadMobile}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">
            No high value leads available
          </div>
        )}
      </div>
    </div>
  );
};

export default High_Leads;