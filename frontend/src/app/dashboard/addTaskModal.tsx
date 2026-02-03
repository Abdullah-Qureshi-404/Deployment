import { useState } from "react";

export default function AddTaskForm({
  token,
  onTaskAdded,
  onClose,
}: {
  token?: string;
  onTaskAdded: (newTask: any) => void;
  onClose: () => void;  // optional
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    startDate: "",
    endDate: "",
  });

  if (!token) {
    console.error("No token found!");
    return <p>No token provided. Please log in.</p>;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      ...formData,
      assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    };

    try {
      const response = await fetch("http://localhost:3000/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
       const data = await response.json();
      onTaskAdded(data.Task)
      console.log("Task Added Successfully");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Task</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
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

        {/* Assigned To (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To (optional)
          </label>
          <input
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            type="email"
            placeholder="Enter assignee email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}
