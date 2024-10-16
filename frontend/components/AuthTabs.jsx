"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const AuthTabs = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const API_ROUTE_LOCAL = "http://localhost:5000/api";
  const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api";

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    try {
      setProgress(20);

      let response = await fetch(`${API_ROUTE_LOCAL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        response = await fetch(`${API_ROUTE_GLOBAL}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, displayName }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setProgress(40);
        setMessage(`Sign Up successful! UID: ${data.uid}`);

        // Sign in the user with Firebase
        setProgress(60);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(userCredential.user);

        setProgress(80);
        let loginResponse = await fetch(`${API_ROUTE_LOCAL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!loginResponse.ok) {
          loginResponse = await fetch(`${API_ROUTE_GLOBAL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
        }

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          setProgress(100);
          localStorage.setItem("token", loginData.token);
          setMessage(`Login successful! Welcome ${loginData.displayName}`);
          router.push("/dashboard");
        } else {
          setMessage(`Error: ${loginData.error}`);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    try {
      setProgress(33);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential.user);

      setProgress(66);
      let response = await fetch(`${API_ROUTE_LOCAL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setProgress(100);
        localStorage.setItem("token", data.token);
        setMessage(`Login successful! Welcome ${data.displayName}`);
        router.push("/dashboard");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("local route failed", error)
      setProgress(66);
      try{
        console.log("Trying global API due to error in local API fetch...");
        const globalResponse = await fetch(`${API_ROUTE_GLOBAL}/auth/login`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await globalResponse.json()

        if (globalResponse.ok) {
          setProgress(100);
          localStorage.setItem("token", data.token);
          setMessage(`Login successful! Welcome ${data.displayName}`);
          router.push("/dashboard");
        } else {
          setMessage(`Error: ${data.error}`);
        }
      }catch(error){
        console.error("Failed to log in", error);
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-8 right-0 px-3 flex items-center"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-8 right-0 px-3 flex items-center"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        {isLoading && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
          </div>
        )}
        {message && (
          <Alert className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthTabs;
