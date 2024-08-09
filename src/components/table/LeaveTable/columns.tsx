"use client";
import { ColumnDef } from "@tanstack/react-table";
import AnalysisModal from "./leave-modal";
import AnalysisTooltip from "./leave-tooltip";
// import { LeavetypeInterface } from "@/lib/types";
import { LeavetypeInterface } from "@/lib/type";
import LeaveToolTip from "./leave-tooltip";
import { Badge } from "@/components/ui/badge";
import LeaveModal from "./leave-modal";

const truncateText = (text: any, length: number) => {
  const str = text ? String(text) : "";
  return str.length <= length ? str : str.substring(0, length) + "...";
};


// _id:Types.ObjectId,  
//   user_id: user_id;
//   leave_type_id: leave_type_id;
//   org_id: Types.ObjectId;
//   start_date: Date;
//   end_date: Date;
//   description?: string;
//   status: "pending" | "approved" | "rejected";
//   createdAt?: Date;
//   updatedAt?: Date;

export const columns: ColumnDef<LeavetypeInterface>[] = [
  {
    accessorKey: "user_id",
    header: "User Name",
    cell: ({ row }) =>
      
      truncateText(row.original.user_id.name || "N/A", 10),
  },
  {
    accessorKey: "leave_type_id",
    header: "Leave Type",
    cell: ({ row }) => (
      // truncateText(row.original.call_info?.unique_identifier || "", 10),
      <LeaveToolTip data={row.original.leave_type_id.name} />
    ),
  },
  {
    accessorKey: "org_id",
    header: "Org id",
    cell: ({ row }) => <LeaveToolTip data={row.original.org_id} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "",
    header: "View",
    cell: ({ row }) => (
      <LeaveModal title="View"/>
    ),
  },
];
