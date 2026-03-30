import { useState } from "react";
import FollowupType from "./FollowupType";
import FollowupStatus from "./FollowupStatus";
import LeadStatus from "./FollowupLeadStatus";
import LeadSource from "./LeadSource";

const tabs = [
  "Follow-up Type",
  "Follow-up Status",
  "Lead Status",
  "Lead Source",
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="w-full">
      <div className="flex gap-8 border-b border-gray-300">
        {tabs?.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                activeTab === tab
                  ? "border-b-2 border-[#1a2a6c] text-[#1a2a6c]"
                  : "text-gray-500 hover:text-blue-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === "Follow-up Type" && (
          <div>
            <FollowupType />
          </div>
        )}
        {activeTab === "Follow-up Status" && <FollowupStatus />}
        {activeTab === "Lead Status" && <LeadStatus />}
        {activeTab === "Lead Source" && <LeadSource />}
      </div>
    </div>
  );
};

export default Settings;
