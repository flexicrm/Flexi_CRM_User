import { Calendar, CircleCheckBig, CircleX, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import Stats from '../../component/Stats/Stats';

const Customer_Stats = () => {
 const {customerTableData} = useSelector((state : any) => state.customer);
  
  // Format the stats data as an array of StatItem objects
  const statsData = [
     {
      title: "Total Customer",
      value: customerTableData?.counts?.active|| 0,
      change: customerTableData?.activeLeads?.percentage,
      icon: Users,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString();
      }
    },
    {
      title: "Active Opportunities",
      value: customerTableData?.counts?.active|| 0,
      change: customerTableData?.activeLeads?.percentage,
      icon: CircleCheckBig,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-50",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toString();
      }
    },
    {
      title: "Inactive Customers",
      value: customerTableData?.counts?.inactive || 0,
      change: customerTableData?.potentialValue?.percentage,
      icon: CircleX,
      iconColor: "text-red-600",
      iconBgColor: "bg-red-50",
      formatValue: (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        // Format with commas for thousands
        return num.toLocaleString('en-US');
      }
    },
    {
      title: "Conversion Rate",
      value: customerTableData?.counts?.active || 0,
      change: customerTableData?.convertedLeads?.percentage,
      icon: Calendar,
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-50",
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

export default Customer_Stats;