"use client";

import { useState, useEffect } from "react";
import { VOICE_OPTIONS } from "@/lib/voiceConfig";

interface VoiceSettingsProps {
  userId: string;
}

export default function VoiceSettings({ userId }: VoiceSettingsProps) {
  const [selectedVoice, setSelectedVoice] = useState("");
  const [originalVoice, setOriginalVoice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current user settings
    fetchUserSettings();
  }, [userId]);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
      
      const response = await fetch(`${apiEndpoint}/user/profile/${encodeURIComponent(userId)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.selectedVoiceId) {
          setSelectedVoice(data.selectedVoiceId);
          setOriginalVoice(data.selectedVoiceId);
        }
      } else if (response.status === 404) {
        // User not found in database yet (might be a Cognito-only user)
        console.log("User profile not found, using default");
      } else {
        console.error("Failed to fetch user settings");
      }
    } catch (err) {
      console.error("Error fetching user settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedVoice === originalVoice) {
      setMessage("No changes to save");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
      
      const response = await fetch(`${apiEndpoint}/user/${encodeURIComponent(userId)}/voice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedVoiceId: selectedVoice,
        }),
      });

      if (response.ok) {
        setOriginalVoice(selectedVoice);
        setMessage("Voice preference updated successfully!");
        setTimeout(() => setMessage(""), 5000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update voice preference");
      }
    } catch (err) {
      console.error("Error saving voice preference:", err);
      setError(err instanceof Error ? err.message : "Failed to save changes");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Voice Settings</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Voice Settings</h2>
      <p className="text-gray-600 mb-4">
        Choose the AI personality for your Strava activity titles
      </p>

      <div className="space-y-2 mb-6">
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
              disabled={isSaving}
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

      {/* Messages */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || selectedVoice === originalVoice}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}