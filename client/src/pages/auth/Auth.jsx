import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppstore } from "@/store";
import Logo from "../../assets/Logo.png"
const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppstore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
      console.log({ response });

      if (response.data.user.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Error logging in:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateSignup()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
      console.log({ response });

      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate("/profile");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Error registering:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-gray-900 text-white">
      <div className="h-[80vh] bg-gray-800 border-2 border-gray-700 text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="mb-8">
            {/* Add your logo here */}  
            <img src={Logo} alt="Logo" className="w-48 h-48 rounded-full" />
          </div>
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">
                <span className="text-red-400">C</span>hit{" "}
                <span className="text-red-400">C</span>hat
              </h1>
            </div>
            <p className="font-medium text-center text-gray-300">Let's get started!</p>
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <Tabs className="w-3/4" defaultValue="login">
            <TabsList className="bg-transparent  w-full">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-transparent text-gray-300 border-b-2 rounded-full w-full data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-red-500 p-3 transition-all duration-300"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-transparent text-gray-300 border-t-2 rounded-full w-full data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-t-red-500 p-3 transition-all duration-300"
              >
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 mt-5 bg-gray-700 text-white border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 mt-5 bg-gray-700 text-white border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-center">
                <Button
                  className="p-6 rounded-full mt-5 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="register">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 mt-5 bg-gray-700 text-white border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 mt-5 bg-gray-700 text-white border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="rounded-full p-6 mt-5 bg-gray-700 text-white border-gray-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="flex items-center justify-center">
                <Button
                  className="p-6 rounded-full mt-5 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;

