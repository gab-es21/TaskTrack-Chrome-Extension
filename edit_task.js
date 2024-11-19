document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "style-blue.css";
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href = savedTheme;
  document.head.appendChild(linkElement);
  
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("id");
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks.find(t => t.id == taskId);

  if (!task) {
    console.error("Task not found.");
    window.close();
    return;
  }
  
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-start-date").value = task.startDate || "";
  document.getElementById("task-due-date").value = task.dueDate || "";
  document.getElementById("task-comments").value = task.comments || "";
  document.getElementById("task-link").value = task.link || "";
  document.getElementById("task-link-alias").value = task.linkAlias || ""; // Load the alias

  document.getElementById("save-task-btn").onclick = () => {
    task.title = document.getElementById("task-title").value;
    task.priority = document.getElementById("task-priority").value;
    task.startDate = document.getElementById("task-start-date").value;
    task.dueDate = document.getElementById("task-due-date").value;
    task.comments = document.getElementById("task-comments").value;
    task.link = document.getElementById("task-link").value;
    task.linkAlias = document.getElementById("task-link-alias").value; // Save the alias

    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Notify the main popup to reload the task list
    chrome.runtime.sendMessage({ action: "reloadTasks" });

    window.close(); // Close the edit popup after saving
  };
});
