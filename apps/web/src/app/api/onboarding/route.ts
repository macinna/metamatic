import { NextRequest, NextResponse } from "next/server";
import { validateE164Phone } from "@/lib/phoneUtils";
import { VOICE_OPTIONS } from "@/lib/voiceConfig";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedVoiceId, phoneNumber, emailAddress } = body;

    // Validate inputs
    if (!selectedVoiceId || !phoneNumber || !emailAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate voice selection
    const validVoice = VOICE_OPTIONS.find(v => v.id === selectedVoiceId);
    if (!validVoice) {
      return NextResponse.json(
        { error: "Invalid voice selection" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validateE164Phone(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Get API endpoint from environment
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.API_ENDPOINT;
    if (!apiEndpoint) {
      console.error("API_ENDPOINT not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Call the API to create user
    const apiResponse = await fetch(`${apiEndpoint}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        emailAddress,
        selectedVoiceId,
      }),
    });

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("API error:", apiData);
      
      // Check for specific error cases
      if (apiResponse.status === 409) {
        return NextResponse.json(
          { error: "An account with this phone number already exists" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: apiData.error || "Failed to create account" },
        { status: apiResponse.status }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      userId: apiData.userId,
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}