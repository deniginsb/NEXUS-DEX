import { NextRequest, NextResponse } from "next/server";

const NEXUS_RPC_URL = "https://testnet.rpc.nexus.xyz";

// Disable Vercel protection for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Proxying RPC request:", body.method, body.params?.[0]);

    const response = await fetch(NEXUS_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("❌ RPC HTTP error:", response.status, response.statusText);
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32000, message: `RPC HTTP error: ${response.status}` }, id: body.id },
        {
          status: 200, // Still return 200 for JSON-RPC error format
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const data = await response.json();
    
    // Log success/error
    if (data.error) {
      console.error("❌ RPC error:", data.error.message);
    } else {
      console.log("✅ RPC success:", body.method);
    }

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("❌ RPC proxy error:", error.message);
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: error.message || "Internal error" }, id: 1 },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
