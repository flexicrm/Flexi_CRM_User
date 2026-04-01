import { CheckSquare } from 'lucide-react';
import Reusable_Button from '../../../component/button/Reusable_Button';

const Column_Selector = () => {
  const columns = ["Lead ID", "Name", "Email", "Mobile", "Status", "Company", "Website", "Created At"];
  
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-lg mx-auto">
      <h3 className="text-lg font-black text-[#0d1954] mb-6">Manage Columns</h3>
      <div className="space-y-3">
        {columns.map((col) => (
          <div key={col} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <span className="font-bold text-slate-600 text-sm">{col}</span>
            <div className="text-indigo-600">
                <CheckSquare size={20} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Reusable_Button text="Save Configuration" fullWidth variant="primary" />
      </div>
    </div>
  );
};

export default Column_Selector;