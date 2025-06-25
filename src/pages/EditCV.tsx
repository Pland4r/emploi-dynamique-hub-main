import CVBuilder from "@/components/CVBuilder";
import { useNavigate } from "react-router-dom";

const EditCV = () => {
  const navigate = useNavigate();
  return (
    <CVBuilder
      onBack={() => navigate("/my-cv")}
      onSave={() => navigate("/my-cv")}
    />
  );
};

export default EditCV; 