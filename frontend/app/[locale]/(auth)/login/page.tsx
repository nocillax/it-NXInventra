"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clear the error from URL
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  const handleLogin = (provider: "google" | "github") => {
    // Clear any existing errors when trying to login again
    setError(null);
    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      console.error("Backend URL not configured");
      return;
    }
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  const { theme } = useTheme();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Image
            src={
              theme === "dark"
                ? "/logos/nocillax-logo-light.png"
                : "/logos/nocillax-logo-dark.png"
            }
            alt="NXInventra Logo"
            width={52}
            height={52}
          />
        </div>
        <CardTitle className="text-2xl font-bold">NXInventra</CardTitle>
        <CardDescription>
          Sign in to create, customize, and share your inventories.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Show error message if exists */}
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Button variant="outline" onClick={() => handleLogin("google")}>
          {theme === "dark" ? (
            <Icons.google.dark className="mr-2 h-4 w-4" />
          ) : (
            <Icons.google.light className="mr-2 h-4 w-4" />
          )}
          Sign in with Google
        </Button>
        <Button variant="outline" onClick={() => handleLogin("github")}>
          {theme === "dark" ? (
            <Icons.github.dark className="mr-2 h-4 w-4" />
          ) : (
            <Icons.github.light className="mr-2 h-4 w-4" />
          )}
          Sign in with GitHub
        </Button>
      </CardContent>
    </Card>
  );
}
