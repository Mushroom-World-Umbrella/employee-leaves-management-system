import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { TbListCheck } from "react-icons/tb";
import { BsCalendar4Event } from "react-icons/bs";
import { MdOutlineBalance } from "react-icons/md";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import { createElement } from "react";

const UserStatsCard = ({
  totalLeaves,
  totalPendingLeaves,
  totalUsers,
}: any) => {
  const UserStatsCardData = [
    {
      key: "leave",
      title: "Total Leaves",
      // change: -2,
      value: totalLeaves,
      icon: TbListCheck,
    },
    {
      key: "user",
      title: "Accepted Leaves",
      // change: 4,
      value: totalUsers,
      icon: HiOutlineUserGroup,
    },
    {
      key: "event",
      title: "Rejected Leaves",
      // change: -20,
      value: totalPendingLeaves,
      icon: BsCalendar4Event,
    },
    {
      key: "balance",
      title: "Balance Left",
      // change: 3,
      value: 20,
      icon: MdOutlineBalance,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 w-full">
      {UserStatsCardData.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {createElement(stat.icon, {
              size: 24,
            })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {/* <p className="text-xs text-muted-foreground">
              <span className="flex items-center">
                {" "}
                {stat.change > 0 ? (
                  <HiArrowNarrowUp className="text-green-600 " size={16} />
                ) : (
                  <HiArrowNarrowDown className="text-red-600 " size={16} />
                )}{" "}
                {stat.change}{" "}
              </span>{" "}
              from last month
            </p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserStatsCard;
