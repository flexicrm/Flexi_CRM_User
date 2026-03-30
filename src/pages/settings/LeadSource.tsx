import { useEffect, useState } from "react";
import Table from "../../component/table/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeadSource,
  deleteLeadSource,
  clearSourceMessage,
  clearSourceError,
  createLeadSource,
  updateLeadSource,
} from "../../store/settingleadSourceSlice";
import type { AppDispatch, RootState } from "../../store/Store";
import ConfirmDeleteModal from "../../component/CommonDeleteModel/CommonDeleteModel";
import Reusable_Button from "../../component/button/Reusable_Button";
import { Check, Plus, X } from "lucide-react";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";

interface LeadSource {
  _id: string;
  sourceName: string;
}

const LeadSource = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    sources,
    deleteLoading,
    deleteMessage,
    deleteError,
    loading,
    message,
    error,
  } = useSelector((state: RootState) => state.leadSource);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getLeadSource());
  }, [dispatch]);

  const tableData: LeadSource[] =
    sources?.map((item: any) => ({
      _id: item._id,
      sourceName: item.sourceName,
    })) || [];

  const columns = [
    {
      title: "Source Name",
      dataIndex: "sourceName",
      key: "sourceName",
    },
  ];

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const pagination = {
    currentPage: page,
    totalItems: tableData.length,
    itemsPerPage: limit,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (l: number) => setLimit(l),
  };

  const handleSubmit = async () => {
    if (!sourceName.trim()) return;

    if (isEditMode && editId) {
      await dispatch(updateLeadSource({ id: editId, sourceName }));
    } else {
      await dispatch(createLeadSource({ sourceName }));
    }
  };

  const handleEditClick = (record: LeadSource) => {
    setShowCreate(true);
    setIsEditMode(true);
    setEditId(record._id);
    setSourceName(record.sourceName);
  };

  const handleDeleteClick = (record: LeadSource) => {
    setSelectedId(record._id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    await dispatch(deleteLeadSource(selectedId));
  };

  useEffect(() => {
    if (message) {
      setSourceName("");
      setShowCreate(false);
      setIsEditMode(false);
      setEditId(null);

      dispatch(getLeadSource());
      dispatch(clearSourceMessage());
    }

    if (error) {
      dispatch(clearSourceError());
    }
  }, [message]);

  useEffect(() => {
    if (deleteMessage) {
      dispatch(getLeadSource());
      dispatch(clearSourceMessage());
      setIsModalOpen(false);
      setSelectedId(null);
    }

    if (deleteError) {
      dispatch(clearSourceError());
    }
  }, [deleteMessage, deleteError]);

  return (
    <>
      <div className="flex justify-end mb-4">
        {!showCreate ? (
          <Reusable_Button
            text="Source"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
            size="px-4 py-2"
          />
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Reusable_Fields
              type="text"
              label="Source Name"
              name="sourceName"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              required
            />

            <Reusable_Button
              text={isEditMode ? "Update" : "Create"}
              icon={<Check size={16} />}
              onClick={handleSubmit}
              size="px-4 py-2"
              isLoading={loading}
            />

            <Reusable_Button
              text="Cancel"
              icon={<X size={16} />}
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setSourceName("");
                setIsEditMode(false);
                setEditId(null);
              }}
              size="px-4 py-2"
              disabled={loading}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        pagination={pagination}
        enableSearch={true}
        actionButtons={{
          showEdit: true,
          showDelete: true,
          onEdit: handleEditClick,
          onDelete: handleDeleteClick,
        }}
      />

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        title="Are you sure you want to delete this item?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
};

export default LeadSource;
