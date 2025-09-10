export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold">Welcome to MetaMatic!</h1>
        
        <div className="space-y-4 text-gray-600">
          <p>
            Your account has been created successfully. You'll receive an SMS confirmation shortly.
          </p>
          <p>
            Next steps:
          </p>
          <ol className="text-left max-w-sm mx-auto space-y-2">
            <li>1. Connect your Strava account in the dashboard</li>
            <li>2. Complete your next workout</li>
            <li>3. Receive AI-generated title suggestions via SMS</li>
            <li>4. Reply to select or customize your activity title</li>
          </ol>
        </div>

        <div className="space-y-3">
          <a
            href="/dashboard"
            className="inline-block w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="inline-block text-sm text-gray-600 hover:text-gray-900"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}