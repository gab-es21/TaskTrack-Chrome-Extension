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
          ${getPriorityIcon(task.priority)} <strong class="task-title">${task.title}</strong>
          <span class="due-date">${task.dueDate || "No Due Date"}</span>
          <span class="task-actions">
            <span class="delete-task" title="Delete Task">🗙</span>
          </span>
        </div>
        <div class="task-details" style="display: none;">
          <p class="task-comments">${task.comments || "No comments"}</p>
          <button class="edit-task-btn" data-id="${task.id}">Edit Task</button>
        </div>
      `;
  
      taskItem.querySelector(".task-header").addEventListener("click", (e) => {
        if (!e.target.classList.contains("status-toggle") && !e.target.classList.contains("delete-task")) {
          const details = taskItem.querySelector(".task-details");
          details.style.display = details.style.display === "none" ? "block" : "none";
        }
      });
  
      taskItem.querySelector(".status-toggle").addEventListener("change", (e) => {
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
  });
  