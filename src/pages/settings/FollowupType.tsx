import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Reusable_Button from "../../component/button/Reusable_Button";
import ConfirmDeleteModal from "../../component/CommonDeleteModel/CommonDeleteModel";
import Reusable_Fields from "../../component/Fields/Reusable_Fiealds";
import {
  errorAlert,
  successAlert,
} from "../../component/Notification/statusHandler";
import Table from "../../component/table/Table";
import {
  clearFollowUpError,
  clearFollowUpMessage,
  createFollowUpType,
  deleteFollowUpType,
  getFollowUpTypes,
  updateFollowUpType,
} from "../../store/settingFollowtypeSlice";
import type { AppDispatch, RootState } from "../../store/Store";

interface FollowUpType {
  _id: string;
  typeName: string;
}

const FollowupType = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    types,
    deleteLoading,
    deleteMessage,
    deleteError,
    loading,
    message,
    error,
  } = useSelector((state: RootState) => state.setting);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
    const {permissions} = useSelector((state : any) => state.auth)
  const Roles = permissions[4]

  useEffect(() => {
    dispatch(getFollowUpTypes());
  }, [dispatch]);

  const tableData: FollowUpType[] =
    types?.map((item: any) => ({
      _id: item?._id,
      typeName: item?.typeName,
    })) || [];

  const columns = [
    {
      title: "Type Name",
      dataIndex: "typeName",
      key: "typeName",
    },
  ];

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const pagination = {
    currentPage: page,
    totalItems: tableData?.length,
    itemsPerPage: limit,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (l: number) => setLimit(l),
  };

  const handleSubmit = async () => {
    if (!typeName.trim()) return;

    if (isEditMode && editId) {
      await dispatch(updateFollowUpType({ id: editId, typeName }));
    } else {
      await dispatch(createFollowUpType({ typeName }));
    }
  };

  const handleEditClick = (record: FollowUpType) => {
    setShowCreate(true);
    setIsEditMode(true);
    setEditId(record?._id);
    setTypeName(record?.typeName);
  };

  const handleDeleteClick = (record: FollowUpType) => {
    setSelectedId(record?._id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    await dispatch(deleteFollowUpType(selectedId));
  };

  useEffect(() => {
    if (message) {
      successAlert(message);
      setTypeName("");
      setShowCreate(false);
      dispatch(getFollowUpTypes());
      dispatch(clearFollowUpMessage());
    }
    if (error) {
      errorAlert(error);
      dispatch(clearFollowUpError());
    }
  }, [message]);

  useEffect(() => {
    if (deleteMessage) {
      successAlert(deleteMessage);
      dispatch(getFollowUpTypes());
      dispatch(clearFollowUpMessage());
      setIsModalOpen(false);
      setSelectedId(null);
    }
    if (deleteError) {
      errorAlert(deleteError);
      dispatch(clearFollowUpError());
    }
  }, [deleteError, deleteMessage]);

  return (
    <>
      <div className="flex justify-end mb-4">
        {!showCreate ? (
          <Reusable_Button
            text="Type"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
            size="px-4 py-2"
            disabled={!Roles?.canCreate}
          />
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Reusable_Fields
              type="text"
              label="Status Name"
              name="typeName"
              value={typeName}
              onChange={(e) => {
                setTypeName(e.target.value);
              }}
              required
            />
            <Reusable_Button
              text="Create"
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
                setTypeName("");
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
          onEdit:Roles?.canRead ? handleEditClick: undefined,
          onDelete:Roles?.canDelete ? handleDeleteClick : undefined,
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

export default FollowupType;
