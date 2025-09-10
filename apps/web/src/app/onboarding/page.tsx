"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VOICE_OPTIONS } from "@/lib/voiceConfig";
import { formatPhoneToE164, validateUSPhone, formatPhoneForDisplay } from "@/lib/phoneUtils";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedVoice, setSelectedVoice] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError("");
    setSubmitError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailAddress(value);
    setEmailError("");
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedVoice) {
      setSubmitError("Please select a voice style");
      return;
    }

    if (!emailAddress) {
      setEmailError("Email address is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return;
    }

    if (!validateUSPhone(phoneNumber)) {
      setPhoneError("Please enter a valid US phone number");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Format phone to E.164
      const formattedPhone = formatPhoneToE164(phoneNumber);
      
      // Submit to API
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedVoiceId: selectedVoice,
          phoneNumber: formattedPhone,
          emailAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Success - redirect to success page or dashboard
      router.push("/onboarding/success");
    } catch (error) {
      console.error("Onboarding error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get Started with MetaMatic</h1>
          <p className="text-gray-600">
            Choose your AI personality and add your phone number to start receiving intelligent Strava activity titles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Your AI Voice Style
            </label>
            <div className="space-y-2">
              {VOICE_OPTIONS.map((voice) => (
                <label
                  key={voice.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVoice === voice.id
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="voice"
                    value={voice.id}
                    checked={selectedVoice === voice.id}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-medium">{voice.label}</p>
                    {voice.description && (
                      <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailAddress}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              We'll use this for account notifications and updates.
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                phoneError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              US phone numbers only. We'll use this to send you SMS notifications.
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          {/* Back Link */}
          <div className="text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Back to home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}