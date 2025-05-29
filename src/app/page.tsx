"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");

  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="text-gray-500 "> Redirecting to login</div>
    </div>
  );
}