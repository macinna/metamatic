import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();
  const phone = (session?.user as any)?.phone as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">MetaMatic</h1>
        
        <div className="space-y-4">
          <p className="text-lg">
            Intelligent assistant for your Strava activities
          </p>
          <p className="text-gray-600">
            MetaMatic automatically renames your Strava workout titles using AI-generated suggestions delivered via SMS. 
            Simply reply to choose your preferred title or customize it with natural language commands.
          </p>
        </div>

        {phone ? (
          <>
            <p>You're logged in with {phone}.</p>
            <p><a className="underline" href="/dashboard">Go to dashboard</a></p>
            <a href="/api/auth/signout" className="inline-block rounded-md px-4 py-2 bg-black text-white">Log out</a>
          </>
        ) : (
          <>
            <a href="/onboarding" className="inline-block rounded-md px-6 py-3 bg-black text-white font-medium">
              Get Started
            </a>
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <form action={async () => { "use server"; await signIn("cognito"); }}>
                <button className="underline text-sm" type="submit">Log in</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
