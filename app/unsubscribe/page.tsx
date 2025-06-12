import UnsubscribePage from "@/components/Subscription/Unsubscribe";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Unsubscribe from Emails",
    description: "Unsubscribe from our email notifications.",
    };

export default function Unsubscribe() {
  return (
    <UnsubscribePage />
  )
}