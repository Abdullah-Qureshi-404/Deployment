import { useEffect, useState } from "react";

export default function EditTask({
  token,
  taskId,
  onClose,
  onTaskUpdate,
}: {
  token?: string;
  taskId: string;
  onClose: () => void;
  onTaskUpdate: (newTask: any) => void;
}) {
  if (!token) {
    console.error("No token found!");
    return <p>No token provided. Please log in.</p>;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/task/id/${taskId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch task");

        const data = await response.json();
        const task = data.Task;

        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setFormData({
          title: task.Title || "",
          description: task.Description || "",
          startDate: formatDate(task.StartDate),
          endDate: formatDate(task.EndDate),
        });

        setAssignedUsers(task.AssignedTo || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTask();
  }, [taskId, token]);

  // Handle text inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  // Remove user
  const handleRemoveUser = (email: string) => {
    setAssignedUsers((prev) => prev.filter((u) => u !== email));
  };

  // Add new user
  const handleAddUser = () => {
    if (newUserEmail && !assignedUsers.includes(newUserEmail)) {
      setAssignedUsers((prev) => [...prev, newUserEmail]);
      setNewUserEmail("");
    }
  };

  // Submit update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

  const body: any = {
    title: formData.title,
    description: formData.description,
    startDate: new Date(formData.startDate).toISOString(),
    endDate: new Date(formData.endDate).toISOString(),
    assignedTo: assignedUsers,
  };
 


    try {
      const response = await fetch(`http://localhost:3000/task/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

       if (!response.ok) {
      throw new Error(data.message || "Failed to update task");
    }
      const updatedTask = data.Task;
      onTaskUpdate(updatedTask);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Task</h2>

      <form className="space-y-5" onSubmit={handleUpdate}>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
            placeholder="Enter task title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Assigned Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Users
          </label>

          {/* Show assigned users as chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {assignedUsers.map((email) => (
              <span
                key={email}
                className="flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => handleRemoveUser(email)}
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Add new user */}
          <div className="flex gap-2">
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter assignee email"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddUser}
              className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Update Task
          </button>
        </div>
      </form>
    </div>
  );
}
