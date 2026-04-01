import { ArrowUpFromLine, Kanban, LayoutGrid, List, Loader2, Plus, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Reusable_Button from '../../component/button/Reusable_Button';
import { fetchLeads } from '../../store/homepage_slice/Leads_slice';
import Bulk_Upload from './Bulk_Upload';
import ExportModal from './ExportModal';
import Grid_View from './View/Grid_View';
import Table_View from './View/Table_View';
import Kanban_View from './View/kanban_View';

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center">
      <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-slate-800 shadow-lg rounded-md">
        {text}
      </span>
      <div className="w-3 h-3 -mt-2 rotate-45 bg-slate-800"></div>
    </div>
  </div>
);

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Track selected Leads

  const currentView = searchParams.get('view') || 'table';
  const { leadsData, loading, error } = useSelector((state: any) => state.leads);

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleViewChange = (view: string) => setSearchParams({ view });

  const renderView = () => {
    if (loading && !leadsData) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500 p-10 text-center">Error: {error}</div>;

    switch (currentView) {
      case 'table': 
        return <Table_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
      case 'grid': 
        return <Grid_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
      case 'bulk': 
        return <Bulk_Upload />;
      case 'kanban': 
        return <Kanban_View />;
      default: 
        return <Table_View data={leadsData?.leads || []} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />;
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0d1954]">Lead Management</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-slate-500 text-sm font-semibold uppercase">{leadsData?.leadsCount || 0} Records</p>
             {selectedIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {selectedIds.length} Selected
                </span>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-3 items-end">
          {/* Row 1: View Switchers */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <Tooltip text="Table View">
              <Reusable_Button 
                variant={currentView === 'table' ? 'primary' : 'ghost'}
                icon={<List size={20} />}
                onClick={() => handleViewChange('table')}
              />
            </Tooltip>
            <Tooltip text="Grid View">
              <Reusable_Button 
                variant={currentView === 'grid' ? 'primary' : 'ghost'}
                icon={<LayoutGrid size={20} />}
                onClick={() => handleViewChange('grid')}
              />
            </Tooltip>
            <Tooltip text="Kanban View">
              <Reusable_Button 
                variant={currentView === 'kanban' ? 'primary' : 'ghost'}
                icon={<Kanban size={20} />}
                onClick={() => handleViewChange('kanban')}
              />
            </Tooltip>
          </div>

          {/* Row 2: Actions */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <Tooltip text="Bulk Upload">
              <Reusable_Button 
                variant={currentView === 'bulk' ? 'primary' : 'ghost'}
                icon={<Upload size={20} />}
                onClick={() => handleViewChange('bulk')}
              />
            </Tooltip>
            <Tooltip text="Export Records">
              <Reusable_Button 
                variant="ghost"
                icon={<ArrowUpFromLine size={20} />}
                onClick={() => setIsExportModalOpen(true)}
              />
            </Tooltip>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" /> {/* Divider */}
            <Tooltip text="Create New Lead">
              <Reusable_Button 
                text='Lead'
                variant="primary"
                icon={<Plus size={20} />}
                onClick={() => navigate(`/${localStorage.getItem('subdomain')}/leads/create-leads/`)}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="w-full">{renderView()}</div>

      {/* Export Modal Component */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        data={leadsData?.leads || []}
        selectedIds={selectedIds}
      />
    </div>
  );
};

export default Leads;