document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "style-blue.css";
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href = savedTheme;
  document.head.appendChild(linkElement);
  
  const saveTaskBtn = document.getElementById("save-task-btn");

  saveTaskBtn.onclick = () => {
    const title = document.getElementById("task-title").value;
    const priority = document.getElementById("task-priority").value;
    const startDate = document.getElementById("task-start-date").value;
    const dueDate = document.getElementById("task-due-date").value;
    const comments = document.getElementById("task-comments").value;
    const link = document.getElementById("task-link").value;
    const linkAlias = document.getElementById("task-link-alias").value; // Add alias field

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    // Generate a unique ID for the task
    const taskId = Date.now();

    const newTask = {
      id: taskId,
      title,
      priority,
      startDate,
      dueDate,
      comments,
      link, 
      linkAlias, // Add alias to the task object
      status: "Not Done"
    };

    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Notify the main popup to reload the task list
    chrome.runtime.sendMessage({ action: "reloadTasks" });

    window.close(); // Close the add task popup after saving
  };
});
