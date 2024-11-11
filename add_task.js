document.addEventListener("DOMContentLoaded", () => {
    const saveTaskBtn = document.getElementById("save-task-btn");
  
    saveTaskBtn.onclick = () => {
      const title = document.getElementById("task-title").value;
      const priority = document.getElementById("task-priority").value;
      const startDate = document.getElementById("task-start-date").value;
      const dueDate = document.getElementById("task-due-date").value;
      const comments = document.getElementById("task-comments").value;
  
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
  