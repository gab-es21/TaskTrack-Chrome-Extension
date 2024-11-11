# TaskTrack Chrome Extension

TaskTrack is a simple, intuitive to-do list Chrome extension designed to help you manage tasks efficiently. With features like prioritization, due dates, rollover of incomplete tasks, and more, TaskTrack keeps you organized directly in your browser.

## Features

- **Add Tasks**: Easily add tasks with optional start and due dates.
- **Prioritize Tasks**: Assign high, medium, or low priority to tasks.
- **Auto-Rollover**: Incomplete tasks automatically roll over to the next day.
- **Task Comments**: Add comments for additional details.
- **Today Button**: Quickly jump back to the current date.
- **Overdue and Completed Task Indicators**: Overdue tasks are highlighted in red, while completed tasks are in green.

## Screenshots
(wip)
[Include screenshots here (popup view, add task view)]

## Getting Started

### Prerequisites

- Google Chrome

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/gab-es21/TaskTrack-Chrome-Extension.git
   ```

2. Open Google Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the upper-right corner).
4. Click on **Load unpacked** and select the `TaskTrack-Chrome-Extension` directory.
5. The TaskTrack extension should now be loaded and accessible from the Chrome toolbar.

### Usage

1. Click the TaskTrack icon in your browser's toolbar to open the extension.
2. Use the **Add Task** button to create new tasks, with options for priority, comments, and dates.
3. Navigate between days using the left and right arrows or the "Today" button to jump back to the current date.
4. Mark tasks as completed or delete them as needed.

## File Structure

The project is organized as follows:

```
TASKTRACK/
│
├── icons/                   # Folder for icon files
│   └── [icon files]
│
├── src/                     # Source folder for HTML, CSS, and JavaScript files
│   ├── add_task.html        # HTML for the Add Task page
│   ├── add_task.js          # JavaScript for Add Task functionality
│   ├── edit_task.html       # HTML for the Edit Task page
│   ├── edit_task.js         # JavaScript for Edit Task functionality
│   ├── popup.html           # HTML for the main popup UI
│   ├── popup.js             # JavaScript for managing tasks and UI in the popup
│   └── style.css            # CSS for styling the extension UI
│
├── manifest.json            # Manifest file for the extension configuration
└── README.md                # README file for project documentation
```

### Explanation

- **`icons/`** - Contains icon files for the extension.
- **`src/`** - Holds the main HTML, CSS, and JavaScript files related to the extension's functionality.
- **`manifest.json`** - Configuration file for the Chrome extension, defining permissions and entry points.
- **`README.md`** - Documentation for the project.

## Contributing

Contributions are welcome! Feel free to submit a pull request or report issues.
