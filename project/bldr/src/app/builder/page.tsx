"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogOut, AlertCircle, Trash2, X, Check } from "lucide-react";
import ClassSearch from "@/components/ClassSearch";
import { Sidebar } from "@/components/Sidebar";
import CalendarEditor from "@/components/CalendarEditor";

export default function Builder() {
  const { user, loading, signOut } = useAuth();
  const { clearDraft, draftSchedule } = useScheduleBuilder();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully", {
        style: {
          fontFamily: "Inter",
          backgroundColor: "#404040",
          color: "#fff",
        },
        duration: 2000,
        icon: <LogOut className="h-5 w-5" />,
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", {
        style: {
          fontFamily: "Inter",
          backgroundColor: "#404040",
          color: "#fff",
        },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  const handleClearSchedule = () => {
    toast(
      <div className="flex flex-col gap-2">
        <p className="font-inter text-white">
          Clear all classes from schedule?
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              clearDraft();
              toast.dismiss();
              toast.success("Schedule cleared", {
                style: {
                  fontFamily: "Inter",
                  backgroundColor: "#404040",
                  color: "#fff",
                },
                duration: 2000,
                icon: <Trash2 className="h-5 w-5" />,
              });
            }}
            className="font-dmsans"
          >
            <Check className="h-4 w-4 mr-1" />
            Confirm
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.dismiss()}
            className="font-dmsans"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>,
      {
        style: {
          fontFamily: "Inter",
          backgroundColor: "#404040",
          color: "#fff",
        },
        duration: Infinity, // Don't auto-dismiss
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-dmsans mb-2">Loading...</h2>
          <p className="text-[#A8A8A8] font-inter">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-figtree font-semibold mb-2">
                <span className="font-dmsans font-bold">
                  <span className="text-white">b</span>
                  <span className="text-red-500">l</span>
                  <span className="text-blue-600">d</span>
                  <span className="text-yellow-300">r</span>
                </span>{" "}
                Schedule Builder
              </h1>
              <p className="text-[#A8A8A8] font-inter">
                Welcome back, {user.email}!
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="font-dmsans cursor-pointer"
            >
              Logout
            </Button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-[3fr_7fr] gap-6">
            {/* Class Search Section */}
            <div className="flex justify-center items-start">
              <ClassSearch />
            </div>

            {/* Calendar Section */}
            <div className="flex flex-col items-end">
              <CalendarEditor />
              <div className="flex gap-4 mt-4">
                <Button className="font-dmsans cursor-pointer w- max-w-[600px]">
                  Save Schedule
                </Button>
                <Button
                  onClick={handleClearSchedule}
                  variant="destructive"
                  className="font-dmsans cursor-pointer w- max-w-[600px]"
                  disabled={draftSchedule.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
