import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { GripVertical, LayoutDashboard, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

// --- Animation Variants (FIXED) ---
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

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sections: reduxSections, isLoading } = useSelector((state: RootState) => state.dashboard);
  const [sections, setSections] = useState<DashboardSection[]>([]);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    if (reduxSections) {
      setSections(reduxSections);
    }
  }, [reduxSections]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
    dispatch(updateLocalLayout(items));
    dispatch(saveDashboardLayout(items));
  };

  const toggleSize = (index: number) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      size: newSections[index].size === 6 ? 12 : 6
    };
    
    setSections(newSections);
    dispatch(updateLocalLayout(newSections));
    dispatch(saveDashboardLayout(newSections));
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

  // FULL PAGE LOADING STATE
  if (isLoading && sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
        <p className="text-slate-500 font-medium tracking-wide">Loading Workspace Overview...</p>
      </div>
    );
  }

  return (
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
              <p className="text-sm text-slate-500 mt-1">Drag and drop widgets to customize your workspace layout.</p>
            </div>
          </div>
        </motion.header>

        {/* --- LAYER 2: DRAGGABLE GRID WIDGETS --- */}
        <motion.main variants={itemVariants}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dashboard-grid" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="grid grid-cols-12 gap-6"
                >
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
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
        </motion.main>

      </div>
    </motion.div>
  );
};

export default Dashboard;