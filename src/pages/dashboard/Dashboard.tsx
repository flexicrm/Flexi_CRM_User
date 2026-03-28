import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { GripVertical, Maximize2 } from "lucide-react";
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

  // Crucial Change: Switch based on the 'sections' string field
  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "Dashboard_Stats": return <Dashboard_Stats />;
      case "Recent_Leads": return <Recent_Leads />;
      case "High_Leads": return <High_Leads />;
      case "Upcomming_FollowU": return <Upcomming_FollowU />;
      case "LeadAcquisitionChart": return <LeadAcquisitionChart />;
      default: return <div className="p-4 text-red-500">Component {componentName} not found</div>;
    }
  };

  if (isLoading && sections.length === 0) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-4 bg-blue-100 min-h-screen bg-slate-50/50">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#05264e]">Dashboard</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-grid" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-12 gap-4"
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
                        transition-all duration-200
                      `}
                      style={{
                        ...provided.draggableProps.style,
                        zIndex: snapshot.isDragging ? 50 : 1
                      }}
                    >
                      <div className={`
                        relative group rounded-xl h-full
                        ${snapshot.isDragging ? "ring-2 ring-blue-500 shadow-xl scale-[1.02]" : ""}
                      `}>
                        {/* Drag Handle & Controls */}
                        <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div 
                            {...provided.dragHandleProps}
                            className="p-1.5 bg-gray-100 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-200 text-gray-500 shadow-sm"
                          >
                            <GripVertical size={16} />
                          </div>
                          
                          {section.sections !== "Dashboard_Stats" && (
                             <button 
                                onClick={() => toggleSize(index)}
                                className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-500 shadow-sm"
                             >
                               <Maximize2 size={16} />
                             </button>
                          )}
                        </div>

                        {/* Use section.sections to render the UI */}
                        <div className={`${snapshot.isDragging ? "pointer-events-none" : ""}`}>
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
    </div>
  );
};

export default Dashboard;