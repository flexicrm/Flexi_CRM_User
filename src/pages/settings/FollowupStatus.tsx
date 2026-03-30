import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFollowUpStatus,
  deleteFollowUpStatus,
  clearStatusMessage,
  clearStatusError,
  createFollowUpStatus,
  updateFollowUpStatus,
} from "../../store/settingFollowStatus";
import type { AppDispatch, RootState } from "../../store/Store";
import ConfirmDeleteModal from "../../component/CommonDeleteModel/CommonDeleteModel";
import Reusable_Button from "../../component/button/Reusable_Button";
import { Check, Plus, X } from "lucide-react";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import Table from "../../component/table/Table";
import {
  errorAlert,
  successAlert,
} from "../../component/Notification/statusHandler";

interface FollowUpStatus {
  _id: string;
  StatusName: string;
  color: string;
}

const FollowupStatus = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    status,
    deleteLoading,
    deleteMessage,
    deleteError,
    loading,
    message,
    error,
  } = useSelector((state: RootState) => state.followStatus);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [statusName, setStatusName] = useState("");
  const [color, setColor] = useState("#0000FF");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  useEffect(() => {
    dispatch(getFollowUpStatus());
  }, [dispatch]);

  const tableData =
    status?.map((item: FollowUpStatus) => ({
      _id: item?._id,
      statusName: item?.StatusName,
      color: item?.color,
    })) || [];

  const pagination = {
    currentPage: page,
    totalItems: tableData.length,
    itemsPerPage: limit,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (l: number) => setLimit(l),
  };

  const columns = [
    {
      title: "Status Name",
      dataIndex: "statusName",
      key: "statusName",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color: string) => (
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: color,
              width: 20,
              height: 20,
              borderRadius: 4,
            }}
          />
          {color}
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    if (!statusName.trim()) return;
    if (isEditMode && editId) {
      await dispatch(
        updateFollowUpStatus({
          id: editId,
          StatusName: statusName,
          color,
        }),
      );
    } else {
      await dispatch(
        createFollowUpStatus({
          StatusName: statusName,
          color,
        }),
      );
    }
  };

  const handleEditClick = (record: any) => {
    setShowCreate(true);
    setIsEditMode(true);
    setEditId(record._id);
    setStatusName(record.statusName);
    setColor(record.color);
  };

  const handleDeleteClick = (record: any) => {
    setSelectedId(record._id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    await dispatch(deleteFollowUpStatus(selectedId));
  };

  useEffect(() => {
    if (message) {
      successAlert(message);
      setStatusName("");
      setColor("#0000FF");
      setShowCreate(false);
      setIsEditMode(false);
      dispatch(getFollowUpStatus());
      dispatch(clearStatusMessage());
    }
    if (error) {
      errorAlert(error);
      dispatch(clearStatusError());
    }
  }, [message]);

  useEffect(() => {
    if (deleteMessage) {
      successAlert(deleteMessage);
      dispatch(getFollowUpStatus());
      dispatch(clearStatusMessage());
      setIsModalOpen(false);
      setSelectedId(null);
    }
    if (deleteError) {
      errorAlert(deleteError);
      dispatch(clearStatusError());
    }
  }, [deleteMessage, deleteError]);

  return (
    <>
      <div className="flex justify-end mb-4">
        {!showCreate ? (
          <Reusable_Button
            text="Status"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
          />
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Reusable_Fields
              type="text"
              label="Status Name"
              name="statusName"
              value={statusName}
              onChange={(e) => setStatusName(e.target.value)}
              required
            />

            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 border rounded"
            />

            <Reusable_Button
              text={isEditMode ? "Update" : "Create"}
              icon={<Check size={16} />}
              onClick={handleSubmit}
              isLoading={loading}
            />

            <Reusable_Button
              text="Cancel"
              icon={<X size={16} />}
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setStatusName("");
                setColor("#0000FF");
                setIsEditMode(false);
              }}
              disabled={loading}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        pagination={pagination}
        enableSearch
        actionButtons={{
          showEdit: true,
          showDelete: true,
          onEdit: handleEditClick,
          onDelete: handleDeleteClick,
        }}
      />

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        title="Are you sure you want to delete this status?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
};

export default FollowupStatus;
