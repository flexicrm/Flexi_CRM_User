import EmptyState from "../../component/EmptyState/EmptyState";
import emptyImg from "/error.jpg";

const Leads = () => {
  return (
    <EmptyState
      title="Welcome to Flexi CRM Leads Page!"
      description="Start creating your opportunities and grow your customer base with ease."
      buttonText="Create New Lead"
      image={emptyImg}
      onButtonClick={() => console.log("Create Lead")}
    />
  );
};

export default Leads;