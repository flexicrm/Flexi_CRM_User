"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import { DraggableItem } from "./DraggableItem";
import { GlassCard } from "./GlassCard";
import Reusable_Button from "../../component/button/Reusable_Button";
import { useDispatch } from "react-redux";
import { createIntegration } from "../../store/integrationSlice";
import type { AppDispatch } from "../../store/Store";

interface FieldItem {
  id: string;
  name: string;
  label: string;
  type: string;
}

const Utilities = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formName, setFormName] = useState("Contact Us");
  const [availableFields, setAvailableFields] = useState<FieldItem[]>([
    { id: "1", name: "name", label: "Full Name", type: "text" },
    { id: "2", name: "email", label: "Email Address", type: "email" },
    { id: "3", name: "mobile", label: "Phone Number", type: "tel" },
    { id: "4", name: "message", label: "Message", type: "textarea" },
    { id: "5", name: "address", label: "Address", type: "text" },
  ]);

  const [selectedFields, setSelectedFields] = useState<FieldItem[]>([]);
  const [platform, setPlatform] = useState("website");
  const [integrationType, setIntegrationType] = useState("React");
  const [generatedCode, setGeneratedCode] = useState("");

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList =
      source.droppableId === "available"
        ? [...availableFields]
        : [...selectedFields];

    const destList =
      destination.droppableId === "available"
        ? [...availableFields]
        : [...selectedFields];

    const [removed] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, removed);

    if (source.droppableId === "available") {
      setAvailableFields(sourceList);
      setSelectedFields(destList);
    } else {
      setSelectedFields(sourceList);
      setAvailableFields(destList);
    }
  };

  const handleSubmit = () => {
    const payload = {
      formName,
      fields: selectedFields.map((f) => ({
        fieldName: f.name,
        fieldType: f.type,
      })),
      platform,
      integrationType,
    };
    console.log("Payload 👉", payload);
    dispatch(
      createIntegration({
        formName,
        fields: selectedFields.map((field) => ({
          fieldName: field.name,
          fieldType: field.type,
        })),
        platform,
        integrationType,
      }),
    );
    setGeneratedCode(JSON.stringify(payload, null, 2));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("Copied!");
  };

  return (
    <div className="h-[calc(100vh-100px)] overflow-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <GlassCard>
            <div className="flex items-center mb-4">
              <h2 className="text-white font-semibold text-lg">
                Form Configuration
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Form Name"
                className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-0"
              >
                <option className="bg-black text-white" value="website">
                  Website
                </option>
                <option className="bg-black text-white" value="app">
                  Mobile App
                </option>
              </select>

              <select
                value={integrationType}
                onChange={(e) => setIntegrationType(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-0"
              >
                <option className="bg-black text-white" value="React">
                  React
                </option>
                <option className="bg-black text-white" value="HTML-js">
                  HTML + JS
                </option>
              </select>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-white mb-2">Available Fields</h3>
                  <Droppable droppableId="available">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 min-h-48"
                      >
                        <AnimatePresence>
                          {availableFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(prov, snap) => (
                                <DraggableItem
                                  provided={prov}
                                  snapshot={snap}
                                  field={field}
                                />
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-2">Selected Fields</h3>
                  <Droppable droppableId="selected">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 min-h-48"
                      >
                        {selectedFields.length === 0 && (
                          <p className="text-white/50 text-center">
                            Drag fields here
                          </p>
                        )}

                        <AnimatePresence>
                          {selectedFields?.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(prov, snap) => (
                                <DraggableItem
                                  provided={prov}
                                  snapshot={snap}
                                  field={field}
                                />
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-2">Generated Code</h3>
                  <div className="bg-black/40 rounded-lg p-3 text-white text-sm min-h-48 overflow-auto">
                    {generatedCode || "Code will appear here"}
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Reusable_Button
                      text="Copy"
                      variant="secondary"
                      onClick={handleCopy}
                    />

                    <Reusable_Button
                      text="Generate"
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={selectedFields.length === 0}
                    />
                  </div>
                </div>
              </div>
            </DragDropContext>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Utilities;
