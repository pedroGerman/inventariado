import { CheckCircle2, MailOpen, MessageSquare } from "lucide-react";
import type { FeedbackStatus } from "@/lib/types/database";
import {
  getFeedbackStatusIconClassName,
  getFeedbackStatusIconContainerClassName,
} from "@/lib/utils/feedbackStatusIcon";

interface FeedbackListIconProps {
  status: FeedbackStatus;
}

function getFeedbackStatusIcon(status: FeedbackStatus) {
  switch (status) {
    case "read":
      return MailOpen;
    case "resolved":
      return CheckCircle2;
    case "pending":
    default:
      return MessageSquare;
  }
}

export function FeedbackListIcon({ status }: FeedbackListIconProps) {
  const Icon = getFeedbackStatusIcon(status);

  return (
    <div className={getFeedbackStatusIconContainerClassName(status)}>
      <Icon className={getFeedbackStatusIconClassName(status)} />
    </div>
  );
}
