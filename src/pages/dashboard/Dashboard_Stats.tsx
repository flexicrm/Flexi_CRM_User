import { Calendar, MessageSquare, PiggyBank, Users } from 'lucide-react';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Stats from '../../component/Stats/Stats';
import { fetchDashboardData } from "../../store/homepage_slice/Dashboard_Slice";
import type { AppDispatch, RootState } from "../../store/Store";

const Dashboard_Stats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  
  useEffect(() => {
    console.log("useEffect triggered");
    dispatch(fetchDashboardData()); 
  }, [dispatch]);
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  const statedata = stats?.data?.summary;
  
  // Format the stats data as an array of StatItem objects
  const statsData = [
    {
      title: "Total Leads",
      value: statedata?.totalLeads?.overall || 0,
      change: statedata?.totalLeads?.percentage,
      icon: Users,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString();
      }
    },
    {
      title: "Active Opportunities",
      value: statedata?.activeLeads?.overall || 0,
      change: statedata?.activeLeads?.percentage,
      icon: MessageSquare,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString();
      }
    },
    {
      title: "Potential Value",
      value: statedata?.potentialValue?.overall || 0,
      change: statedata?.potentialValue?.percentage,
      icon: PiggyBank,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      prefix: "₹",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        // Format with commas for thousands
        return num.toLocaleString('en-US');
      }
    },
    {
      title: "Conversion Rate",
      value: statedata?.convertedLeads?.overall || 0,
      change: statedata?.convertedLeads?.percentage,
      icon: Calendar,
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-50",
      suffix: "%",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString();
      }
    }
  ];

  return (
    <div>
      <Stats 
        stats={statsData}
        columns={4}
        showChange={true}
        showTarget={false}
      />
    </div>
  );
};

export default Dashboard_Stats;