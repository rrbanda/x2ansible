import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://host.containers.internal:8000";

// Do not destructure, do not annotate 'context' inline!
export async function GET(request: NextRequest, context: any) {
  // Use context.params.agentId in the body
  const agentId = context.params.agentId;

  try {
    console.log("🔍 Fetching agent configuration for:", agentId);

    const response = await fetch(`${BACKEND_URL}/api/admin/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Backend response status:", response.status);

    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log("✅ Backend JSON response:", JSON.stringify(data, null, 2));
    } else {
      const textResponse = await response.text();
      console.error("❌ Backend returned non-JSON:", textResponse);
      return NextResponse.json(
        { error: "Backend returned invalid response", detail: textResponse },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("❌ Backend error response:", data);
      return NextResponse.json(
        {
          error: `Failed to fetch agent ${agentId}`,
          detail: data.detail || data.error || "Unknown backend error"
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Admin agent fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch agent configuration",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
