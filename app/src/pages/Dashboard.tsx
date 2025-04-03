import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import StatsComponent from "./Stats";
import Timer from "./Timer";
import { User } from "../models/User";
import { Task } from "../models/Task";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const API_URL = "http://localhost:8000/task";

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMouseInsideSidebar, setIsMouseInsideSidebar] = useState(false);
  const [isStatsPopupVisible, setIsStatsPopupVisible] = useState(false);

  const fetchTasks = async () => {
    if (!user || !user._id) return;

    try {
      const response = await fetch(`${API_URL}/getAll?owner=${user._id}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Handle mouse hover to show/hide sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is near the left edge or inside the sidebar
      if (e.clientX <= 10) {
        setIsSidebarVisible(true);
      } else if (!isMouseInsideSidebar) {
        setIsSidebarVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMouseInsideSidebar]);

  return (
      // Full viewport container with no overflow
      <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden">
        {/* Fixed header */}
        <header className="flex-none h-16 bg-orange-500 text-white flex items-center px-4 shadow text-3xl font-bold">
          Task Manager
        </header>
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <aside
              onMouseEnter={() => setIsMouseInsideSidebar(true)}
              onMouseLeave={() => {
                setIsMouseInsideSidebar(false);
                setIsSidebarVisible(false);
              }}
              className={`bg-white shadow-lg fixed left-0 top-0 h-full transition-transform duration-500 ease-in-out ${
                  isSidebarVisible ? "translate-x-0 w-64" : "-translate-x-full w-0"
              }`}
          >
            {isSidebarVisible && (
                <Sidebar onLogout={onLogout} onShowStats={() => setIsStatsPopupVisible(true)} />
            )}
          </aside>
          {/* Main layout: Calendar and Timer side-by-side */}
          <main className="flex flex-1 overflow-hidden">
            <div className="flex flex-row h-full w-full">
              <div className="flex-grow bg-white h-full">
                <div className="h-full w-full">
                  <Calendar user={user} tasks={tasks} fetchTasks={fetchTasks} />
                </div>
              </div>
              <div className="w-[25%] bg-white h-full">
                <div className="h-full w-full">
                  <Timer />
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* Stats popup */}
        {isStatsPopupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <button onClick={() => setIsStatsPopupVisible(false)} className="text-red-500">
                  Close
                </button>
                <StatsComponent user={user} tasks={tasks} setTasks={setTasks} fetchTasks={fetchTasks} />
              </div>
            </div>
        )}
      </div>
  );
};

export default Dashboard;