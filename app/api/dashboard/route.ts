import { NextResponse } from "next/server";
import { getUnifiedMemberData } from "@/lib/member-data";

export async function GET() {
  try {
    const data = await getUnifiedMemberData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
