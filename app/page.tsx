import Dashboard from "@/components/dashboard";
import Pricing from "@/components/pricing";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div>
      {userId ? <Dashboard /> : <Pricing />}
  </div>
  );
}
