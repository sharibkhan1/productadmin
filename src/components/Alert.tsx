// components/Alert.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AlertProps {
  type: "default" | "destructive" | "default";
  message: string;
  action?: string;
}

const CustomAlert = ({ type, message, action }: AlertProps) => {
  return (
    <Alert variant={type}>
      <AlertTitle>{action ? `Action: ${action}` : "Notification"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default CustomAlert;
