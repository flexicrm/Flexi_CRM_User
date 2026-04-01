import { useNavigate, useSearchParams } from "react-router-dom";
import Table, { type Column } from "../../../component/table/Table";
import AddFollowUp_Model from "../AddFaloowUp_Model";
import Convert_custommer_Model from "../Convert_custommer_Model";

interface TableViewProps {
  data: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

const Table_View = ({ data, selectedIds, setSelectedIds }: TableViewProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const columns: Column[] = [
    {
      title: "Lead ID",
      dataIndex: "LeadId",
      key: "LeadId",
      width: "140px",
      render: (val) => (
        <span className="text-[12px] font-bold text-[#0d1954] uppercase tracking-wider">
          {val}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "manualData",
      key: "name",
      render: (manualData) => (
        <span className="text-[13px] text-slate-700 font-semibold">
          {manualData?.name || "-"}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "manualData",
      key: "email",
      render: (manualData) => (
        <span className="text-[13px] text-slate-500 lowercase">
          {manualData?.email || "-"}
        </span>
      ),
    },
    {
      title: "Company Name",
      dataIndex: "manualData",
      key: "company",
      render: (manualData) => (
        <span className="text-[13px] text-slate-500 lowercase">
          {manualData?.company || "-"}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "manualData",
      key: "mobileNo",
      render: (manualData) => (
        <span className="text-[13px] text-slate-600 font-medium">
          {manualData?.mobileNo || "-"}
        </span>
      ),
    },
    {
      title: "Follow-Up",
      dataIndex: "followUps",
      key: "followUps",
      width: "180px",
      render: (followUps) => {
        if (!followUps || followUps.length === 0) {
          return (
            <span className="text-[11px] text-slate-400 italic">
              No Follow-Ups
            </span>
          );
        }
        const lastFollowUp = followUps[followUps.length - 1];
        return (
          <div className="flex flex-col gap-0.5 max-w-[170px]">
            <span className="text-[11px] font-bold text-indigo-600">
              {new Date(lastFollowUp.date).toLocaleDateString()}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1 italic">
              "{lastFollowUp.note}"
            </span>
          </div>
        );
      },
    },
    {
      title: "Source",
      dataIndex: "leadsource",
      key: "source",
      render: (val) => (
        <span className="text-[12px] text-[#0d1954] font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
          {val || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mt-4">
      <Table
        columns={columns}
        data={data}
        showSelection={true}
        // IMPORTANT: Assuming your custom Table component exposes onRowSelectionChange or similar
        // Adjust this prop to match whatever your `<Table>` component uses to return selected array
        onSelectionChange={(selectedRows) => {
            // Check if selectedRows is array of objects or IDs. Assuming objects here.
            const ids = selectedRows.map((r: any) => r.LeadId);
            setSelectedIds(ids);
        }}
        pagination={{
          currentPage: 1,
          totalItems: data.length,
          itemsPerPage: 5,
          onPageChange: (page) => console.log("Navigating to page:", page),
        }}
        actionButtons={{
          showView: true,
          showEdit: true,
          showDelete: false,
          showFollowUp: true,
          showConvert: true,

          onEdit: (record) =>
            navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`, {
              state: { tableData: record, tableId: record.LeadId },
            }),

          onView: (record) =>
            navigate(`/${localStorage.getItem("subdomain")}/leads/view-leads`, {
              state: { tableId: record.LeadId },
            }),

          onFollowUp: (record) => {
            setSearchParams({
              modal: "schedule-followup",
              LeadId: record.LeadId,
            });
          },

          onConvert: (record) => {
            setSearchParams({
              modal: "convert-customer",
              LeadId: record.LeadId,
            });
          },
        }}
      />

      {/* MODALS */}
      <AddFollowUp_Model tableId={searchParams.get("LeadId")} />
      <Convert_custommer_Model tableId={searchParams.get("LeadId")} data={data}/>
    </div>
  );
};

export default Table_View;