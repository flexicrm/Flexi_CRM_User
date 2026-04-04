import Flexi_CRM_Logo from "../../assets/logo/Flexi_CRM_Logo.svg";

const RippleLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm">
      <img 
        src={Flexi_CRM_Logo}
        alt="Loading..." 
        className="w-10 h-10 object-contain animate-pulse"
      />
    </div>
  );
};

export default RippleLoader;