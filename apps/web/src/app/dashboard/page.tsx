import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VoiceSettings from "./VoiceSettings";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) {
        redirect('/');
    }
    const phone = (session.user as any)?.phone;
    const userId = (session.user as any)?.id || (session.user as any)?.sub;
    
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
                
                <div className="space-y-8">
                    {/* Account Info */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                <span className="font-medium">Phone:</span> {phone ?? 'Not set'}
                            </p>
                            {userId && (
                                <p className="text-gray-600">
                                    <span className="font-medium">User ID:</span> {userId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Voice Settings */}
                    {userId && <VoiceSettings userId={userId} />}

                    {/* Strava Connection (placeholder) */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Strava Connection</h2>
                        <p className="text-gray-600 mb-4">Connect your Strava account to start receiving AI-generated activity titles.</p>
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600" disabled>
                            Connect Strava (Coming Soon)
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <a className="text-gray-600 hover:text-gray-900" href="/">← Back to home</a>
                </div>
            </div>
        </div>
    );
}
