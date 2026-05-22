// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Local Storage Key
const STORAGE_KEY = 'todoTasks';

// Current filter state
let currentFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateTaskCount();
    addEventListeners();
});

// Add event listeners
function addEventListeners() {
    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    clearBtn.addEventListener('click', clearCompletedTasks);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });
}

// Get all tasks from local storage
function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to local storage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const tasks = getTasks();
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    tasks.push(newTask);
    saveTasks(tasks);
    
    todoInput.value = '';
    todoInput.focus();
    
    renderTasks();
    updateTaskCount();
}

// Delete a task
function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    saveTasks(tasks);
    renderTasks();
    updateTaskCount();
}

// Toggle task completion status
function toggleTask(id) {
    let tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
        updateTaskCount();
    }
}

// Clear all completed tasks
function clearCompletedTasks() {
    if (confirm('Are you sure you want to delete all completed tasks?')) {
        let tasks = getTasks();
        tasks = tasks.filter(task => !task.completed);
        saveTasks(tasks);
        renderTasks();
        updateTaskCount();
    }
}

// Render tasks based on current filter
function renderTasks() {
    const tasks = getTasks();
    todoList.innerHTML = '';

    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>${currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : `No ${currentFilter} tasks.`}</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="todo-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Load tasks from local storage
function loadTasks() {
    renderTasks();
}

// Update task count
function updateTaskCount() {
    const tasks = getTasks();
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'}`;
    
    // Disable clear button if no completed tasks
    const completedTasks = tasks.filter(task => task.completed).length;
    clearBtn.disabled = completedTasks === 0;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
