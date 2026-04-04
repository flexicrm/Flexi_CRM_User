import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { GripVertical, LayoutDashboard, Loader2, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import RippleLoader from "../../component/Loader/RippleLoader";
import { errorAlert, successAlert } from "../../component/Notification/statusHandler";
import type { AppDispatch, RootState } from "../../store/Store";
import {
  fetchDashboardData,
  saveDashboardLayout,
  updateLocalLayout,
  type DashboardSection
} from "../../store/homepage_slice/Dashboard_Slice";

import Dashboard_Stats from "./Dashboard_Stats";
import High_Leads from "./High_Leads";
import LeadAcquisitionChart from "./LeadAcquisitionChart";
import Recent_Leads from "./Recent_Leads";
import Upcomming_FollowU from "./Upcomming_FollowU";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 },
  },
};

// --- Tooltip Component ---
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
      <span className="relative z-10 px-2.5 py-1.5 text-[11px] font-semibold text-white whitespace-nowrap bg-slate-800 shadow-xl rounded-md">
        {text}
      </span>
      <div className="w-2.5 h-2.5 -mt-1.5 rotate-45 bg-slate-800 rounded-sm"></div>
    </div>
  </div>
);

// Helper function to extract error message from API response
const extractErrorMessage = (error: any): string => {
  let errorMessage = "Error occurred while loading dashboard. Please try again.";
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.errors) {
      if (typeof responseData.errors === 'string') {
        errorMessage = responseData.errors;
      } else if (typeof responseData.errors === 'object') {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        if (firstErrorKey && responseData.errors[firstErrorKey]) {
          errorMessage = Array.isArray(responseData.errors[firstErrorKey]) 
            ? responseData.errors[firstErrorKey][0] 
            : responseData.errors[firstErrorKey];
        } else {
          errorMessage = JSON.stringify(responseData.errors);
        }
      }
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    errorMessage = "Network error. Please check your internet connection and try again.";
  }
  
  return errorMessage;
};

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sections: reduxSections, isLoading, error } = useSelector((state: RootState) => state.dashboard);
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchDashboard = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      }
      await dispatch(fetchDashboardData()).unwrap();
      
      if (!isInitialLoad && showRefreshLoader) {
        successAlert("Dashboard refreshed successfully!", "Great", "Refreshed");
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      if (!isInitialLoad) {
        errorAlert(errorMessage, "Retry", "Load Failed");
      }
    } finally {
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchDashboard(false);
  }, [dispatch]);

  useEffect(() => {
    if (reduxSections && reduxSections.length > 0) {
      setSections(reduxSections);
    }
  }, [reduxSections]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
    dispatch(updateLocalLayout(items));
    
    // Save layout to server
    try {
      setIsSaving(true);
      await dispatch(saveDashboardLayout(items)).unwrap();
      successAlert("Layout saved successfully!", "Great");
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      errorAlert(errorMessage, "Retry", "Save Failed");
      // Revert to previous layout on error
      if (reduxSections) {
        setSections(reduxSections);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSize = async (index: number) => {
    const newSections = [...sections];
    const oldSize = newSections[index].size;
    newSections[index] = {
      ...newSections[index],
      size: newSections[index].size === 6 ? 12 : 6
    };
    
    setSections(newSections);
    dispatch(updateLocalLayout(newSections));
    
    // Save layout to server
    try {
      setIsSaving(true);
      await dispatch(saveDashboardLayout(newSections)).unwrap();
      successAlert(`Widget ${newSections[index].size === 6 ? "shrunk" : "expanded"} successfully!`, "Great");
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      errorAlert(errorMessage, "Retry", "Save Failed");
      // Revert on error
      newSections[index].size = oldSize;
      setSections(newSections);
      dispatch(updateLocalLayout(newSections));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "Dashboard_Stats": return <Dashboard_Stats />;
      case "Recent_Leads": return <Recent_Leads />;
      case "High_Leads": return <High_Leads />;
      case "Upcomming_FollowU": return <Upcomming_FollowU />;
      case "LeadAcquisitionChart": return <LeadAcquisitionChart />;
      default: return (
        <div className="flex items-center justify-center h-full p-8 bg-white border border-rose-200 rounded-3xl text-rose-500 font-medium">
          Component "{componentName}" not found
        </div>
      );
    }
  };

  // Show error state if initial load fails
  if (error && !reduxSections?.length && !isRefreshing && !isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard size={40} className="text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FULL PAGE LOADING STATE
  if (isInitialLoad && isLoading && sections.length === 0) {
    return <RippleLoader />;
  }

  const isLoadingState = isLoading || isRefreshing || isSaving;

  return (
    <>
      {/* Show overlay loader during refresh/save */}
      {(isRefreshing || isSaving) && <RippleLoader />}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10"
      >
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* --- LAYER 1: HERO HEADER --- */}
          <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <LayoutDashboard size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-slate-500">Drag and drop widgets to customize your workspace layout.</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {sections.length} Widget{sections.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <Tooltip text="Refresh Dashboard">
              <button
                onClick={handleRefresh}
                disabled={isLoadingState}
                className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </Tooltip>
          </motion.header>

          {/* --- LAYER 2: DRAGGABLE GRID WIDGETS --- */}
          <motion.main variants={itemVariants}>
            {sections.length === 0 && !isLoadingState ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <LayoutDashboard size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Widgets Configured</h3>
                <p className="text-sm text-slate-500">No dashboard widgets are currently available.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dashboard-grid" direction="horizontal">
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={`grid grid-cols-12 gap-6 transition-all duration-200 ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/30 rounded-3xl p-2 -m-2' : ''
                      }`}
                    >
                      {sections.map((section, index) => (
                        <Draggable 
                          key={section.id} 
                          draggableId={section.id} 
                          index={index}
                          isDragDisabled={isLoadingState}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                col-span-12 
                                ${section.size === 6 ? "lg:col-span-6" : "lg:col-span-12"}
                                transition-[width,height] duration-300 ease-in-out
                              `}
                              style={{
                                ...provided.draggableProps.style,
                                zIndex: snapshot.isDragging ? 50 : 1
                              }}
                            >
                              <div className={`
                                relative group h-full rounded-3xl transition-all duration-300
                                ${snapshot.isDragging ? "ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10 scale-[1.02]" : "hover:shadow-lg hover:shadow-slate-200/50"}
                                ${isLoadingState ? "opacity-70 pointer-events-none" : ""}
                              `}>
                                
                                {/* Glassmorphism Widget Controls Overlay */}
                                <div className={`
                                  absolute top-3 right-3 z-30 flex items-center gap-1 p-1 
                                  bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  ${snapshot.isDragging ? "opacity-100 shadow-md bg-white" : ""}
                                `}>
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 cursor-grab active:cursor-grabbing transition-colors"
                                    title="Drag to move widget"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  
                                  {/* Only show resize button if not Dashboard_Stats */}
                                  {section.sections !== "Dashboard_Stats" && (
                                    <button 
                                      onClick={() => toggleSize(index)}
                                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                      title={section.size === 6 ? "Expand Widget" : "Shrink Widget"}
                                      disabled={isLoadingState}
                                    >
                                      {section.size === 6 ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                    </button>
                                  )}
                                </div>

                                {/* Widget Content */}
                                <div className={`h-full w-full ${snapshot.isDragging ? "pointer-events-none opacity-90" : ""}`}>
                                  {renderComponent(section.sections)}
                                </div>
                                
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </motion.main>

          {/* Save indicator */}
          {isSaving && (
            <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Saving layout...</span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;