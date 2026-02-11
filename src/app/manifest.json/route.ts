import { NextResponse } from "next/server";
import { buildManifest } from "@/app/_manifest";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildManifest());
}
