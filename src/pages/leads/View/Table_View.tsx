import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Table, { type Column } from "../../../component/table/Table";
import AddFollowUp_Model from "../AddFaloowUp_Model";
import Convert_custommer_Model from "../Convert_custommer_Model";

interface TableViewProps {
  data: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

const Table_View = ({ data, setSelectedIds }: TableViewProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Find the selected lead data based on LeadId
  const selectedLeadId = searchParams.get("LeadId");
  const selectedLeadData = data.find(lead => lead.LeadId === selectedLeadId);
  const {permissions} = useSelector((state : any) => state.auth)
  const Roles = permissions[1]

  const columns: Column[] = [
    {
      title: "Lead ID",
      dataIndex: "LeadId",
      key: "LeadId",
      width: "140px",
      sortable: true,
      render: (val: any) => (
        <span className="text-[12px] font-bold text-[#0d1954] uppercase tracking-wider">
          {val}
        </span>
      ),
    },
    {
  title: "Name",
  dataIndex: "manualData",
  key: "name",
  render: (manualData: any) => (
    <span className="text-[13px] text-slate-700 font-semibold">
      {manualData?.name || "-"}
    </span>
  ),
},
    {
      title: "Email",
      dataIndex: "manualData",
      key: "email",
      render: (manualData: any) => (
        <span className="text-[13px] text-slate-500 lowercase">
          {manualData?.email || "-"}
        </span>
      ),
    },
    {
      title: "Company",
      dataIndex: "manualData",
      key: "company",
      render: (manualData: any) => (
        <span className="text-[13px] text-slate-500">
          {manualData?.company || "-"}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "manualData",
      key: "mobileNo",
      render: (manualData: any) => (
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
      render: (followUps: any) => {
        if (!followUps || followUps.length === 0) {
          return <span className="text-[11px] text-slate-400 italic">No Follow-Ups</span>;
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
      render: (val: any) => (
        <span className="text-[12px] text-[#0d1954] font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
          {val || "N/A"}
        </span>
      ),
    },
  ];

  

  return (
    <div className="w-full bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden mt-6">
      <Table
        columns={columns}
        data={data}
        showSelection={true}
        onSelectionChange={(selectedRows: any[]) => {
          const ids = selectedRows.map((r: any) => r.LeadId);
          setSelectedIds(ids);
        }}
        enableSearch={true}
        searchPlaceholder="Search Leads..."
         actionButtons={{
    showView: Roles?.canRead,
    showEdit: Roles?.canEdit,
    showFollowUp: Roles?.canCreate,   
    showConvert: Roles?.canCreate,  

    onEdit: Roles?.canEdit
      ? (record: any) =>
          navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`, {
            state: { tableData: record, tableId: record.LeadId },
          })
      : undefined,

    onView: Roles?.canRead
      ? (record: any) =>
          navigate(`/${localStorage.getItem("subdomain")}/leads/view-leads`, {
            state: { tableId: record.LeadId },
          })
      : undefined,

    onFollowUp: Roles?.canCreate
      ? (record: any) => {
          setSearchParams({
            modal: "schedule-followup",
            LeadId: record.LeadId,
          });
        }
      : undefined,

    onConvert: Roles?.canCreate
      ? (record: any) => {
          setSearchParams({
            modal: "convert-customer",
            LeadId: record.LeadId,
          });
        }
      : undefined,
  }}
        pagination={{
          currentPage,
          itemsPerPage,
          totalItems: data.length,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (newSize: number) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
        }}
      />

      {/* MODALS */}
      {searchParams.get("modal") === "schedule-followup" && (
        <AddFollowUp_Model 
          tableId={selectedLeadId} 
          selectedData={selectedLeadData}
        />
      )}
      
      {searchParams.get("modal") === "convert-customer" && (
  <Convert_custommer_Model 
    tableId={selectedLeadId} 
    selectedData={selectedLeadData}
  />
)}
    </div>
  );
};

export default Table_View;