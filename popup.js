document.addEventListener("DOMContentLoaded", () => {
  const currentDateSpan = document.getElementById("current-date");
  const taskListToDo = document.getElementById("task-list-todo");
  const taskListDone = document.getElementById("task-list-done");
  const addTaskBtn = document.getElementById("add-task-btn");
  const doneSectionHeader = document.getElementById("done-section-header");
  const toDoSectionHeader = document.getElementById("todo-section-header");
  const toggleDoneBtn = document.getElementById("toggle-done-btn");
  const searchBar = document.getElementById("search-bar");
  const prevDayBtn = document.getElementById("prev-day");
  const nextDayBtn = document.getElementById("next-day");

  const tabButtons = document.querySelectorAll(".tab-button");
  const tabs = document.querySelectorAll(".tab");
  const themeSelect = document.getElementById("theme-select");
  const themeLink = document.getElementById("theme-link");

  const deleteAllDataBtn = document.getElementById("delete-all-data-btn");


  const todayBtn = document.createElement("button");
  todayBtn.id = "today-btn";
  todayBtn.textContent = "Today";
  todayBtn.style.display = "none";
  todayBtn.style.marginTop = "5px";
  document.getElementById("header").appendChild(todayBtn);

  let currentDate = new Date();
  updateCurrentDateDisplay();

  prevDayBtn.addEventListener("click", () => {
    changeDate(-1);
  });

  nextDayBtn.addEventListener("click", () => {
    changeDate(1);
  });

  todayBtn.addEventListener("click", () => {
    currentDate = new Date();
    updateCurrentDateDisplay();
    loadTasks(searchBar.value.trim().toLowerCase());
  });

  addTaskBtn.onclick = () => {
    chrome.windows.getCurrent((currentWindow) => {
      chrome.windows.create({
        url: "add_task.html",
        type: "popup",
        width: 400,
        height: 600,
        left: currentWindow.left,
        top: currentWindow.top
      });
    });
  };

  function updateCurrentDateDisplay() {
    currentDateSpan.textContent = currentDate.toDateString();
    todayBtn.style.display = isToday(currentDate) ? "none" : "block";
  }

  function isToday(date) {
    const today = new Date();
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  }

  function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateCurrentDateDisplay();
    loadTasks(searchBar.value.trim().toLowerCase());
  }

  searchBar.addEventListener("input", () => {
    loadTasks(searchBar.value.trim().toLowerCase());
  });

  toggleDoneBtn.addEventListener("click", () => {
    if (taskListDone.style.display === "none") {
      taskListDone.style.display = "block";
      toggleDoneBtn.textContent = "Hide";
    } else {
      taskListDone.style.display = "none";
      toggleDoneBtn.textContent = "Show";
    }
  });

  function loadTasks(searchQuery = "") {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const todayStr = currentDate.toISOString().split("T")[0];

    tasks.sort((a, b) => {
      const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      const dateA = new Date(a.dueDate || "9999-12-31").toISOString().split("T")[0];
      const dateB = new Date(b.dueDate || "9999-12-31").toISOString().split("T")[0];
      return dateA.localeCompare(dateB);
    });

    taskListToDo.innerHTML = "";
    taskListDone.innerHTML = "";

    let hasToDo = false;
    let hasDone = false;

    tasks.forEach((task) => {
      const taskStartDate = task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : null;
      const taskDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : null;
      const taskCompletionDate = task.completionDate ? new Date(task.completionDate).toISOString().split("T")[0] : null;

      if (!task.title.toLowerCase().includes(searchQuery)) {
        return;
      }

      if (task.status === "Done" && taskCompletionDate === todayStr) {
        displayTask(task, taskListDone, true);
        hasDone = true;
      } else if (task.status === "Not Done") {
        const isOverdue = taskDueDate && taskDueDate < todayStr;
        if (!taskStartDate || taskStartDate <= todayStr) {
          displayTask(task, taskListToDo, false, isOverdue);
          hasToDo = true;
        }
      }
    });

    toDoSectionHeader.style.display = hasToDo ? "block" : "none";
    doneSectionHeader.style.display = hasDone ? "block" : "none";
  }

  function displayTask(task, listElement, isDone, isOverdue = false) {
    const taskItem = document.createElement("li");
    taskItem.className = `task ${isDone ? "completed" : ""} ${isOverdue ? "overdue" : ""}`;
    taskItem.setAttribute("data-id", task.id);
    taskItem.innerHTML = `
      <div class="task-header">
        <input type="checkbox" class="status-toggle" ${isDone ? "checked" : ""} />
        ${getPriorityGraphic(task.priority)} <strong class="task-title">${task.title}</strong>
        <span class="due-date">${task.dueDate || "No Due Date"}</span>
        <span class="task-actions">
          <span class="delete-task" title="Delete Task">🗙</span>
        </span>
      </div>
      <div class="task-details" style="display: none;">
        <p class="task-comments">${task.comments || "No comments"}</p>
        ${task.link ? `<a href="${task.link}" target="_blank" class="task-link">${task.linkAlias || "Open Link"}</a>` : ""}
        <button class="edit-task-btn" data-id="${task.id}">Edit Task</button>
      </div>
    `;

    taskItem.querySelector(".task-header").addEventListener("click", (e) => {
        if (!e.target.classList.contains("status-toggle") && !e.target.classList.contains("delete-task")) {
            const details = taskItem.querySelector(".task-details");
            details.style.display = details.style.display === "none" ? "block" : "none";
        }
    });

    taskItem.querySelector(".status-toggle").addEventListener("change", () => {
        toggleTaskStatus(task.id);
    });

    taskItem.querySelector(".delete-task").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    taskItem.querySelector(".edit-task-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditTaskPopup(task.id);
    });

    listElement.appendChild(taskItem);
}

function getPriorityGraphic(priority) {
    const styles = {
        High: 'background-color: #FF0000; color: #FFFFFF;',
        Medium: 'background-color: #FFA500; color: #FFFFFF;',
        Low: 'background-color: #008000; color: #FFFFFF;'
    };
    return `<span class="priority-label" style="padding: 2px 8px; border-radius: 4px; ${styles[priority] || ''}">${priority}</span>`;
}





  function getPriorityIcon(priority) {
    const icons = {
      "High": "🔺",
      "Medium": "🔴",
      "Low": "🔻"
    };
    return icons[priority] || "";
  }

  function toggleTaskStatus(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      task.status = task.status === "Done" ? "Not Done" : "Done";
      if (task.status === "Done") {
        task.completionDate = currentDate.toISOString().split("T")[0];
      } else {
        delete task.completionDate;
      }
      localStorage.setItem("tasks", JSON.stringify(tasks));
      loadTasks(searchBar.value.trim().toLowerCase());
    }
  }

  function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks = tasks.filter(task => task.id != taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks(searchBar.value.trim().toLowerCase());
  }

  function openEditTaskPopup(taskId) {
    chrome.windows.getCurrent((currentWindow) => {
      chrome.windows.create({
        url: `edit_task.html?id=${taskId}`,
        type: "popup",
        width: 400,
        height: 600,
        left: currentWindow.left,
        top: currentWindow.top
      });
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "reloadTasks") {
      loadTasks(searchBar.value.trim().toLowerCase());
    }
  });

  loadTasks();

  // Function to switch tabs
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      tabs.forEach(tab => tab.style.display = "none");
      tabButtons.forEach(btn => btn.classList.remove("active"));

      document.getElementById(`${tabName}-tab`).style.display = "block";
      button.classList.add("active");
  });
});


  // Load the selected theme from local storage
  const savedTheme = localStorage.getItem("selectedTheme") || "style-blue.css";
  themeLink.setAttribute("href", savedTheme);
  themeSelect.value = savedTheme;

  // Handle theme changes
  themeSelect.addEventListener("change", () => {
    const selectedTheme = themeSelect.value;
    themeLink.setAttribute("href", selectedTheme);
    localStorage.setItem("selectedTheme", selectedTheme);
  });

  // Initially activate the tasks tab
  tabButtons[0].click();

  deleteAllDataBtn.addEventListener("click", () => {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const doneTasks = tasks.filter(task => task.status === "Done").length;
    const overdueTasks = tasks.filter(task => {
      const taskDueDate = new Date(task.dueDate || "9999-12-31").toISOString().split("T")[0];
      return task.status !== "Done" && taskDueDate < new Date().toISOString().split("T")[0];
    }).length;
    const missingTasks = tasks.length - doneTasks - overdueTasks;
  
    const confirmationMessage =
      `You are about to delete all tasks. This action cannot be undone!\n\n` +
      `Summary:\n` +
      `- Completed Tasks: ${doneTasks}\n` +
      `- Overdue Tasks: ${overdueTasks}\n` +
      `- Pending Tasks: ${missingTasks}\n` +
      `Total Tasks: ${tasks.length}\n\n` +
      `Are you sure you want to proceed?`;
  
    const confirmation = confirm(confirmationMessage);
  
    if (confirmation) {
      localStorage.removeItem("tasks");
      loadTasks();
    }
  });

  // Add event listener to Save Local button
  document.getElementById("save-local-btn").addEventListener("click", saveLocalData);

  // Add event listener to Load Local Data button
  document.getElementById("load-local-btn").addEventListener("click", loadLocalData);

  function saveLocalData() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const jsonString = JSON.stringify(tasks, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TaskTrackList.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function loadLocalData() {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'TaskTrack JSON File',
        accept: {
          'application/json': ['.json']
        }
      }],
      multiple: false
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    
    try {
      const tasksFromFile = JSON.parse(text);
      // Validate the loaded structure if necessary
      if (Array.isArray(tasksFromFile)) {
        localStorage.setItem("tasks", JSON.stringify(tasksFromFile));
        loadTasks();
        alert("Tasks loaded successfully");
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      console.error("Failed to load tasks from file", error);
      alert("Failed to load tasks. Please ensure the file is in the correct format.");
    }
  }

  const popupSizeInput = document.getElementById("popup-size");
  const popupSizeValue = document.getElementById("popup-size-value");
  const popupContainer = document.getElementById("popup-container");

  // Load saved popup size from localStorage
  const savedPopupSize = localStorage.getItem("popupSize") || 320;
  popupContainer.style.width = `${savedPopupSize}px`;
  popupSizeInput.value = savedPopupSize;
  popupSizeValue.textContent = `${savedPopupSize}px`;

  // Update displayed size on input (for live feedback)
  popupSizeInput.addEventListener("input", () => {
    const newSize = popupSizeInput.value;
    popupSizeValue.textContent = `${newSize}px`;
  });

  // Apply new size when the mouse button is released
  popupSizeInput.addEventListener("change", () => {
    const newSize = popupSizeInput.value;
    popupContainer.style.width = `${newSize}px`;
    localStorage.setItem("popupSize", newSize); // Save the new size
  });


});
