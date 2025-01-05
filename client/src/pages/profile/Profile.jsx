import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { UPDATE_PROFILE } from "@/utils/constants";
import { useAppstore } from "@/store";

export default function Profile() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppstore();
  const [firstName, setFirstName] = useState(userInfo.firstName || "");
  const [lastName, setLastName] = useState(userInfo.lastName || "");

  // Single color for all users
  const defaultColor = "#712c4a57"; // Set your desired default color here

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName.trim()) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE,
          { firstName, lastName, color: defaultColor }, // Ensure lastName is here
          { withCredentials: true }
        );
  
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Updated Successfully");
          navigate("/chat");
        }
      } catch (error) {
        console.error("Error updating profile:", error.response?.data || error.message);
        toast.error("An error occurred while updating the profile.");
      }
    }
  };
  
  

  return (
    <div className="bg-foreground min-h-screen flex justify-center items-center flex-col gap-10 p-4">
      <div className="flex flex-col gap-10 w-full max-w-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="self-start"
        >
          <ArrowLeft className="h-6 w-6 text-white hover:text-black" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <div className="relative flex items-center justify-center">
        <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden">
  <div
    className="uppercase h-full w-full flex items-center justify-center text-[#ff006e] border-[1px] border-[#ff006faa] rounded-full text-5xl"
    style={{ backgroundColor: "#712c4a57" }} // This is the default color
  >
    {firstName
      ? firstName.charAt(0).toUpperCase()+lastName.charAt(0).toUpperCase()
      : userInfo.email.charAt(0).toUpperCase()}
  </div>
</Avatar>

        </div>
        <div className="flex flex-col gap-5">
          <Input
            placeholder="Email"
            type="email"
            disabled
            value={userInfo.email}
          />
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <Button className="w-full max-w-md mt-8" onClick={saveChanges}>
        Save Changes
      </Button>
    </div>
  );
}
