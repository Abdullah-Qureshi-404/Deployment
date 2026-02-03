"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import AddTaskForm from "./addTaskModal";
import EditTask from "./editTaskModal";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<any>(null);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const token = Cookies.get("auth_token");
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/task", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data.Task);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  useEffect(() => {
    if (!selectedTaskId) return;

    const fetchTaskById = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/task/id/${selectedTaskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch task details");

        const data = await response.json();
        setTaskDetails(data.Task);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTaskById();
  }, [selectedTaskId, token]);

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id);
  };

  const closeSidebar = () => {
    setSelectedTaskId(null);
    setTaskDetails(null);
  };

  const handleTaskAdded = (newTask: any) => {
    setTasks((prev) => [...prev, newTask]);
  };
  const handleTaskUpdated = async (updatedTask: any) => {
    setTasks((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );

    if (selectedTaskId === updatedTask._id) {
      try {
        const response = await fetch(
          `http://localhost:3000/task/id/${selectedTaskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch task details");

        const data = await response.json();
        setTaskDetails(data.Task);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogout = async () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/task/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTask) => prevTask.filter((task) => task._id !== id));
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Error Deleting task");
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const toDoTasks = tasks.filter((t) => t.status === "to-do");
 useEffect(() => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("UserName");
    setUsername(user);
  }
}, []);
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Greeting */}
      <div className=" flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 mb-4">
        Hey! <span className="text-amber-500 text-center"> {username}</span> 👋
      </div>

      {/* Dashboard title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 ">Dashboard</h1>

      {/* Add Task Button */}
      <div className="flex justify-end mr-16">
        <button
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          onClick={() => setAddTaskModal(true)}
        >
          Add Task
        </button>
      </div>

      {/* to-do Tasks */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">To-Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toDoTasks.map((task) => (
            <div
              onClick={() => {
                handleTaskClick(task._id);
              }}
              key={task._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-800"
            >
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* In Progress Tasks */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">In Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inProgressTasks.map((task) => (
            <div
              onClick={() => {
                handleTaskClick(task._id);
              }}
              key={task._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border-l-4 border-yellow-400"
            >
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Tasks */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Completed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {completedTasks.map((task) => (
            <div
              onClick={() => {
                handleTaskClick(task._id);
              }}
              key={task._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border-l-4 border-green-400"
            >
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          ))}
        </div>
      </section>

      {selectedTaskId && taskDetails && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transition-transform transform translate-x-0 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Task Details
            </h2>
            <button
              onClick={closeSidebar}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Title & Status */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {taskDetails.Title}
              </h1>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  taskDetails.Status === "completed"
                    ? "bg-green-100 text-green-800"
                    : taskDetails.Status === "in_progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {taskDetails.Status}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Description
              </h3>
              <p className="text-gray-700">{taskDetails.Description}</p>
            </div>

            {/* Assigned To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Assigned To
              </h3>
              <p className="text-gray-700">
                {taskDetails.AssignedTo?.join(", ")}
              </p>
            </div>

            {/* Created By */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Created By
              </h3>
              <p className="text-gray-700">{taskDetails.CreatedBy}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">
                  Start Date
                </h3>
                <p className="text-gray-700">
                  {new Date(taskDetails.StartDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">
                  End Date
                </h3>
                <p className="text-gray-700">
                  {new Date(taskDetails.EndDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Last Comment */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">
                Last Comment
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                {taskDetails.Comment?.length > 0
                  ? taskDetails.Comment[taskDetails.Comment.length - 1].Comment
                  : "No comments yet"}
              </p>
            </div>
          </div>

          {/* uploads  */}
          {/* <div>
              <p className="text-gray-700">
                <span className="font-medium">Uploads: </span>
                {taskDetails.uploads}
              </p>
            </div>  */}

          {/* Footer */}
          <div className="p-6 border-t flex justify-between space-x-2">
            <button
              className="bg-red-600 rounded-md p-2 text-white hover:bg-red-700"
              onClick={() => handleDeleteTask(selectedTaskId)}
            >
              Delete Task
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-16"
              onClick={() => {
                setEditTaskModal(true);
              }}
            >
              Edit
            </button>

            <button
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
              onClick={closeSidebar}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addTaskModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-60">
          <div className="bg-white p-6 rounded-2xl w-[600px] shadow-lg h-[700px] overflow-y-auto">
            <div>
              <div className="flex justify-end">
                <button
                  onClick={() => setAddTaskModal(false)}
                  className=" text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              <AddTaskForm
                token={token}
                onTaskAdded={handleTaskAdded}
                onClose={() => setAddTaskModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {editTaskModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-60">
          <div className="bg-white p-6 rounded-2xl w-[600px] shadow-lg h-[700px] overflow-y-auto">
            <div>
              <div className="flex justify-end">
                <button
                  onClick={() => setEditTaskModal(false)}
                  className=" text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              <EditTask
                onTaskUpdate={handleTaskUpdated}
                token={token}
                taskId={selectedTaskId}
                onClose={() => setEditTaskModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end mr-16">
        <button
          className="bg-red-600 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out mt-[300px]"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
