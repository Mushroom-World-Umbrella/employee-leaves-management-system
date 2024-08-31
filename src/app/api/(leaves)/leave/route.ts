import { LeaveRequestEmail } from "@/components/email-temp/LeaveRequestTemplate";
import { connect_db } from "@/configs/db";
import { auth_middleware } from "@/lib/auth-middleware";
import { calculateLeaveBalance } from "@/lib/balanceservices";
import { LeaveType } from "@/models/leave-type.model";
import { Leave } from "@/models/leave.model";
import { Membership } from "@/models/membership.model";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

connect_db();

export const POST = async (req: NextRequest) => {
  try {
    const {
      user_id,
      leave_type_id,
      org_id,
      start_date,
      end_date,
      description,
      docs,
    } = await req.json();

    if (!user_id || !leave_type_id || !org_id || !start_date || !end_date) {
      return NextResponse.json(
        { msg: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const membership = await Membership.findOne({ user_id })
      .populate("user_id")
      .populate("manager_id");

    const leavetype = await LeaveType.findById(leave_type_id);

    const leaveBalance = await calculateLeaveBalance(
      user_id,
      new Date(start_date).getFullYear(),
      leavetype.name
    );

    if (leaveBalance.total.available <= 0) {
      return NextResponse.json(
        {
          msg: "You cannot take this leave due to insufficient balance available",
        },
        { status: 403 }
      );
    } else {
      if (leaveBalance.monthly.available <= 0) {
        return NextResponse.json(
          {
            msg: "You cannot take this leave due to insufficient balance available",
          },
          { status: 403 }
        );
      }
    }

    // Create a new leave request
    const newLeave = new Leave({
      user_id,
      leave_type_id,
      org_id,
      start_date,
      end_date,
      description,
      docs,
      status: "pending",
    });

    // Save the new leave request to the database
    await newLeave.save();

    // Send message to manager
    const { data, error } = await resend.emails.send({
      from: "Acme <team@qtee.ai>",
      to: membership.manager_id.email,
      subject: "Leave Request Raised",
      react: LeaveRequestEmail({
        employeeName: membership.manager_id.name,
        leaveStartDate: start_date,
        leaveEndDate: end_date,
        leaveReason: leavetype.name,
      }),
      html: "5",
    });

    // Respond with the created leave request and email response
    return NextResponse.json(
      {
        msg: "Leave request created successfully",
        data: { membership, data },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
  }
};

// export const GET = async (req: NextRequest) => {
//     try {
//         const leaves = await Leave.find().populate('user_id' ,  "-password -createdAt -updatedAt -verification_code -is_verified").populate("leave_type_id").populate("org_id" , [] , Org);
//         return NextResponse.json({ msg: "All Leaves fetched Successfully" , data: leaves}, { status: 200 });

//     } catch (error) {
//         console.log(error);
//         return NextResponse.json({ msg: "Something went wrong" }, { status: 500 });
//     }
// }

// export async function GET(req: NextRequest) {
//     try {
//       const org_id = req.nextUrl.searchParams.get("org_id");
//       const name = req.nextUrl.searchParams.get("name");
//       const status = req.nextUrl.searchParams.get("status");
//       const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
//       const limit = 10;
//       const skip = (page - 1) * limit;

//       // Build the query for leaves
//       let leaveQuery: any = {};

//       if (status) {
//         leaveQuery.status = status;
//       }
//       let leaveAggregation: any[] = [
//         { $match: leaveQuery },
//         {
//           $lookup: {
//             from: "users",
//             localField: "user_id",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         {
//           $unwind: "$user",
//         },
//         {
//           $lookup: {
//             from: "leavetypes",
//             localField: "leave_type_id",
//             foreignField: "_id",
//             as: "leave_type",
//           },
//         },
//         {
//           $unwind: "$leave_type",
//         },
//         {
//           $lookup: {
//             from: "orgs",
//             localField: "org_id",
//             foreignField: "_id",
//             as: "org",
//           },
//         },
//         {
//           $unwind: "$org",
//         },
//         {
//           $project: {
//             "user.password": 0, // Exclude password
//             "user.verification_code": 0, // Exclude verification_code
//             "user.createdAt": 0, // Exclude createdAt
//             "user.updatedAt": 0, // Exclude updatedAt
//             "user.is_verified": 0, // Exclude is_verified
//             "leave_type_id": 0, // Exclude leave_type id
//             "org_id": 0, // Exclude org id
//             "user_id": 0, // Exclude org id
//           },
//         },
//       ];

//       if (name) {
//         leaveAggregation.push({
//           $match: {
//             "user.name": {
//               $regex: name,
//               $options: "i", // Case-insensitive search
//             },
//           },
//         });
//       }

//       if (org_id) {
//         leaveAggregation.push({
//           $match: {
//             "org._id": new mongoose.Types.ObjectId(org_id),
//           },
//         });
//       }

//       leaveAggregation.push(
//         { $sort: { createdAt: -1 } },
//         { $skip: skip },
//         { $limit: limit }
//       );

//       const leaves = await Leave.aggregate(leaveAggregation);

//       const totalLeaves = await Leave.countDocuments(leaveQuery);
//       const totalPages = Math.ceil(totalLeaves / limit);

//     //   const leaves = await Leave.find(leaveQuery)
//     //     .populate("user_id", "-password -createdAt -updatedAt -verification_code -is_verified")
//     //     .populate("leave_type_id")
//     //     .populate("org_id", [], Org)
//     //     .sort({ createdAt: -1 })
//     //     .skip(skip)
//     //     .limit(limit);

//       return NextResponse.json(
//         {
//           pagination: {
//             totalLeaves,
//             totalPages,
//             currentPage: page,
//             limit,
//           },
//           leaves,
//         },
//         { status: 200 }
//       );
//     } catch (error: any) {
//       console.error("Error fetching leaves:", error);
//       return NextResponse.json(
//         { error: error.message || "Internal Server Error" },
//         { status: 500 }
//       );
//     }
//   }

export async function GET(req: NextRequest) {
  try {
    const auth: any = await auth_middleware(req);
    const org_id = req.nextUrl.searchParams.get("org_id");
    const name = req.nextUrl.searchParams.get("name");
    const status = req.nextUrl.searchParams.get("status");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Authorization check
    if (auth[0] === null || auth[1] !== null) {
      console.error("Authentication error:", auth[1]);
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const auth_data = auth[0];
    let leaveQuery: any = {};

    // Role-based leave query filtering
    if (auth_data.membership.role === "admin") {
      // Admin can view leaves of all users
    } else if (
      auth_data.membership.role === "hr" ||
      auth_data.membership.role === "manager"
    ) {
      // HR/Managers can view leaves within their organization
      leaveQuery.org_id = auth_data.membership.org_id;
    } else {
      // Employees can view only their own leaves
      leaveQuery.user_id = auth_data.membership.user_id;
    }

    // Additional filters (status and name)
    if (status) {
      leaveQuery.status = status;
    }

    // Aggregation pipeline
    let leaveAggregation: any[] = [
      { $match: leaveQuery },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "leavetypes",
          localField: "leave_type_id",
          foreignField: "_id",
          as: "leave_type",
        },
      },
      { $unwind: "$leave_type" },
      {
        $lookup: {
          from: "orgs",
          localField: "org_id",
          foreignField: "_id",
          as: "org",
        },
      },
      { $unwind: "$org" },
      {
        $project: {
          "user.password": 0,
          "user.verification_code": 0,
          "user.createdAt": 0,
          "user.updatedAt": 0,
          "user.is_verified": 0,
          leave_type_id: 0,
          org_id: 0,
          user_id: 0,
        },
      },
    ];

    // Filter by employee name (case-insensitive)
    if (name) {
      leaveAggregation.push({
        $match: {
          "user.name": {
            $regex: name,
            $options: "i",
          },
        },
      });
    }

    // Add sorting, skipping, and limiting for pagination
    leaveAggregation.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the aggregation
    const leaves = await Leave.aggregate(leaveAggregation);

    // Get the total number of leaves for pagination
    const totalLeaves = await Leave.countDocuments(leaveQuery);
    const totalPages = Math.ceil(totalLeaves / limit);

    return NextResponse.json(
      {
        leaves,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
