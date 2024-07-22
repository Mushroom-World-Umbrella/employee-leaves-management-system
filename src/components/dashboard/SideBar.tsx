"use client";
import { LineChart, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden border-r bg-muted/40  lg:w-[230px] w-[220px] md:block ">
        <div className="flex h-full  max-h-[100vh] flex-col gap-2 lg:w-[230px] w-[220px] sticky top-0 left-0  ">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 g:w-[300px]">
            <Link href="/" className="flex items-center font-semibold ">
              <Image
                src=""
                alt="Logo"
                width={100}
                height={40}
                className="filter invert"
              />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 ">
              <Link
                href={`/dashboard`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  pathname.includes("dashboard")
                    ? "bg-muted text-primary"
                    : " text-muted-foreground"
                } text-muted-foreground transition-all hover:text-primary`}
              >
                <LineChart className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/members"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  pathname.includes("members")
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                }  transition-all hover:text-primary`}
              >
                <UsersIcon className="h-4 w-4" />
                Members
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
