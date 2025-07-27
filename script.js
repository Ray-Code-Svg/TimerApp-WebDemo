// TimerApp Web演示 JavaScript

class TimerApp {
    constructor() {
        this.tasks = [];
        this.timeBlocks = [];
        this.selectedTask = null;
        this.selectedColor = '#007AFF';
        this.zoomLevel = 1;
        this.draggedElement = null;
        this.isResizing = false;
        this.resizeHandle = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateTimeRuler();
        this.addSampleTasks();
        this.updateStatistics();
        this.showHelp();
    }
    
    setupEventListeners() {
        // 添加任务按钮
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });
        
        // 今天按钮
        document.getElementById('todayBtn').addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('datePicker').value = today;
        });
        
        // 日期选择器
        document.getElementById('datePicker').addEventListener('change', (e) => {
            console.log('日期已更改:', e.target.value);
        });
        
        // 模版按钮
        document.getElementById('templateBtn').addEventListener('click', () => {
            this.showTemplateOptions();
        });
        
        // 缩放控制
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
            this.updateZoom();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
            this.updateZoom();
        });
        
        // 模态框事件
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideTaskModal();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideTaskModal();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveTask();
        });
        
        // 颜色选择器
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(opt => 
                    opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
            });
        });
        
        // 点击模态框外部关闭
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.hideTaskModal();
            }
        });
        
        // 回收站拖拽事件
        const trashZone = document.getElementById('trashZone');
        trashZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            trashZone.classList.add('drag-over');
        });
        
        trashZone.addEventListener('dragleave', () => {
            trashZone.classList.remove('drag-over');
        });
        
        trashZone.addEventListener('drop', (e) => {
            e.preventDefault();
            trashZone.classList.remove('drag-over');
            this.handleTrashDrop(e);
        });
        
        // 时间轴点击事件
        document.getElementById('timelineMain').addEventListener('click', (e) => {
            if (e.target.classList.contains('timeline-track')) {
                this.handleTimelineClick(e);
            }
        });
        
        // 设置今天的日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('datePicker').value = today;
    }
    
    generateTimeRuler() {
        const ruler = document.getElementById('timeRuler');
        ruler.innerHTML = '';
        
        for (let hour = 0; hour < 24; hour++) {
            const mark = document.createElement('div');
            mark.className = `time-mark ${hour % 6 === 0 ? 'major' : ''}`;
            mark.style.left = `${(hour / 24) * 100}%`;
            mark.textContent = `${hour.toString().padStart(2, '0')}:00`;
            ruler.appendChild(mark);
        }
    }
    
    addSampleTasks() {
        const sampleTasks = [
            { name: '工作学习', color: '#007AFF' },
            { name: '运动健身', color: '#34C759' },
            { name: '休闲娱乐', color: '#FF9500' },
            { name: '生活杂务', color: '#AF52DE' }
        ];
        
        sampleTasks.forEach(task => {
            this.addTask(task.name, task.color);
        });
        
        // 添加一些示例时间块
        this.addTimeBlock(0, 9, 2, '#007AFF'); // 工作学习 9:00-11:00
        this.addTimeBlock(0, 14, 1.5, '#007AFF'); // 工作学习 14:00-15:30
        this.addTimeBlock(1, 7, 1, '#34C759'); // 运动健身 7:00-8:00
        this.addTimeBlock(2, 20, 2, '#FF9500'); // 休闲娱乐 20:00-22:00
    }
    
    addTask(name, color) {
        const task = {
            id: Date.now() + Math.random(),
            name,
            color,
            duration: 0
        };
        
        this.tasks.push(task);
        this.renderTasks();
        this.renderTimeline();
        return task;
    }
    
    addTimeBlock(taskIndex, startHour, duration, color) {
        const timeBlock = {
            id: Date.now() + Math.random(),
            taskIndex,
            startHour,
            duration,
            color
        };
        
        this.timeBlocks.push(timeBlock);
        this.updateTaskDuration(taskIndex);
        this.renderTimeline();
        this.updateStatistics();
    }
    
    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        this.tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.draggable = true;
            taskElement.dataset.taskIndex = index;
            
            taskElement.innerHTML = `
                <div class="task-color" style="background: ${task.color}"></div>
                <span class="task-name">${task.name}</span>
                <span class="task-duration">${this.formatDuration(task.duration)}</span>
            `;
            
            // 拖拽事件
            taskElement.addEventListener('dragstart', (e) => {
                this.draggedElement = { type: 'task', index };
                taskElement.classList.add('dragging');
            });
            
            taskElement.addEventListener('dragend', () => {
                taskElement.classList.remove('dragging');
                this.draggedElement = null;
            });
            
            taskList.appendChild(taskElement);
        });
    }
    
    renderTimeline() {
        const timelineMain = document.getElementById('timelineMain');
        timelineMain.innerHTML = '';
        
        this.tasks.forEach((task, taskIndex) => {
            const row = document.createElement('div');
            row.className = 'timeline-row';
            
            const label = document.createElement('div');
            label.className = 'task-label';
            label.innerHTML = `
                <div class="task-color" style="background: ${task.color}"></div>
                ${task.name}
            `;
            
            const track = document.createElement('div');
            track.className = 'timeline-track';
            track.dataset.taskIndex = taskIndex;
            
            // 添加该任务的时间块
            this.timeBlocks
                .filter(block => block.taskIndex === taskIndex)
                .forEach(block => {
                    const blockElement = this.createTimeBlockElement(block);
                    track.appendChild(blockElement);
                });
            
            row.appendChild(label);
            row.appendChild(track);
            timelineMain.appendChild(row);
        });
    }
    
    createTimeBlockElement(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'time-block';
        blockElement.style.left = `${(block.startHour / 24) * 100}%`;
        blockElement.style.width = `${(block.duration / 24) * 100}%`;
        blockElement.style.background = block.color;
        blockElement.dataset.blockId = block.id;
        blockElement.draggable = true;
        
        const startTime = this.formatTime(block.startHour);
        const endTime = this.formatTime(block.startHour + block.duration);
        blockElement.textContent = `${startTime}-${endTime}`;
        
        // 调整大小手柄
        const leftHandle = document.createElement('div');
        leftHandle.className = 'resize-handle left';
        const rightHandle = document.createElement('div');
        rightHandle.className = 'resize-handle right';
        
        blockElement.appendChild(leftHandle);
        blockElement.appendChild(rightHandle);
        
        // 拖拽事件
        blockElement.addEventListener('dragstart', (e) => {
            this.draggedElement = { type: 'timeBlock', block };
            blockElement.classList.add('dragging');
        });
        
        blockElement.addEventListener('dragend', () => {
            blockElement.classList.remove('dragging');
            this.draggedElement = null;
        });
        
        // 调整大小事件
        leftHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startResize(block, 'left', e);
        });
        
        rightHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startResize(block, 'right', e);
        });
        
        return blockElement;
    }
    
    handleTimelineClick(e) {
        if (this.tasks.length === 0) {
            alert('请先添加任务！');
            return;
        }
        
        const track = e.target;
        const taskIndex = parseInt(track.dataset.taskIndex);
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickPercent = clickX / rect.width;
        const startHour = clickPercent * 24;
        
        // 默认创建1小时的时间块
        const duration = 1;
        const color = this.tasks[taskIndex].color;
        
        this.addTimeBlock(taskIndex, startHour, duration, color);
    }
    
    startResize(block, handle, e) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.resizingBlock = block;
        
        const onMouseMove = (e) => {
            if (!this.isResizing) return;
            
            const track = e.target.closest('.timeline-track');
            if (!track) return;
            
            const rect = track.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mousePercent = mouseX / rect.width;
            const mouseHour = mousePercent * 24;
            
            if (handle === 'left') {
                const newDuration = (block.startHour + block.duration) - mouseHour;
                if (newDuration > 0.25) {
                    block.startHour = mouseHour;
                    block.duration = newDuration;
                }
            } else {
                const newDuration = mouseHour - block.startHour;
                if (newDuration > 0.25) {
                    block.duration = newDuration;
                }
            }
            
            this.renderTimeline();
            this.updateStatistics();
        };
        
        const onMouseUp = () => {
            this.isResizing = false;
            this.resizeHandle = null;
            this.resizingBlock = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    updateTaskDuration(taskIndex) {
        const task = this.tasks[taskIndex];
        if (!task) return;
        
        task.duration = this.timeBlocks
            .filter(block => block.taskIndex === taskIndex)
            .reduce((total, block) => total + block.duration, 0);
    }
    
    updateStatistics() {
        const totalAllocated = this.timeBlocks.reduce((total, block) => total + block.duration, 0);
        const remaining = 24 - totalAllocated;
        
        document.getElementById('allocatedTime').textContent = this.formatDuration(totalAllocated);
        document.getElementById('remainingTime').textContent = this.formatDuration(remaining);
        
        // 更新任务持续时间
        this.tasks.forEach((task, index) => {
            this.updateTaskDuration(index);
        });
        this.renderTasks();
    }
    
    formatDuration(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}小时${m}分钟`;
    }
    
    formatTime(hour) {
        const h = Math.floor(hour);
        const m = Math.round((hour - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    
    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('modalTitle');
        const nameInput = document.getElementById('taskName');
        
        if (task) {
            title.textContent = '编辑任务';
            nameInput.value = task.name;
            this.selectedColor = task.color;
            this.selectedTask = task;
        } else {
            title.textContent = '添加任务';
            nameInput.value = '';
            this.selectedColor = '#007AFF';
            this.selectedTask = null;
        }
        
        // 更新颜色选择器
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === this.selectedColor);
        });
        
        modal.classList.add('show');
        nameInput.focus();
    }
    
    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('show');
    }
    
    saveTask() {
        const nameInput = document.getElementById('taskName');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('请输入任务名称！');
            return;
        }
        
        if (this.selectedTask) {
            // 编辑现有任务
            this.selectedTask.name = name;
            this.selectedTask.color = this.selectedColor;
        } else {
            // 添加新任务
            this.addTask(name, this.selectedColor);
        }
        
        this.hideTaskModal();
    }
    
    showTemplateOptions() {
        const templates = [
            { name: '工作日模版', tasks: ['工作', '午餐', '会议', '学习'] },
            { name: '周末模版', tasks: ['运动', '购物', '娱乐', '休息'] },
            { name: '学习模版', tasks: ['上课', '作业', '复习', '休息'] }
        ];
        
        const templateNames = templates.map(t => t.name).join('\n');
        const selected = prompt(`选择模版:\n${templateNames}\n\n请输入模版名称:`);
        
        const template = templates.find(t => t.name === selected);
        if (template) {
            this.applyTemplate(template);
        }
    }
    
    applyTemplate(template) {
        // 清空现有任务和时间块
        this.tasks = [];
        this.timeBlocks = [];
        
        // 添加模版任务
        const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D92', '#5856D6'];
        template.tasks.forEach((taskName, index) => {
            this.addTask(taskName, colors[index % colors.length]);
        });
        
        this.updateStatistics();
    }
    
    handleTrashDrop(e) {
        if (!this.draggedElement) return;
        
        if (this.draggedElement.type === 'task') {
            const taskIndex = this.draggedElement.index;
            // 删除任务及其所有时间块
            this.timeBlocks = this.timeBlocks.filter(block => block.taskIndex !== taskIndex);
            this.tasks.splice(taskIndex, 1);
            
            // 更新剩余任务的索引
            this.timeBlocks.forEach(block => {
                if (block.taskIndex > taskIndex) {
                    block.taskIndex--;
                }
            });
            
            this.renderTasks();
            this.renderTimeline();
            this.updateStatistics();
        } else if (this.draggedElement.type === 'timeBlock') {
            const blockId = this.draggedElement.block.id;
            this.timeBlocks = this.timeBlocks.filter(block => block.id !== blockId);
            this.renderTimeline();
            this.updateStatistics();
        }
    }
    
    updateZoom() {
        document.getElementById('zoomLevel').textContent = `${Math.round(this.zoomLevel * 100)}%`;
        
        // 更新时间轴缩放
        const timelineMain = document.getElementById('timelineMain');
        timelineMain.style.transform = `scaleX(${this.zoomLevel})`;
        timelineMain.style.transformOrigin = 'left center';
    }
    
    showHelp() {
        // 显示帮助面板3秒后自动隐藏
        setTimeout(() => {
            const helpPanel = document.getElementById('helpPanel');
            if (helpPanel) {
                helpPanel.style.display = 'flex';
            }
        }, 1000);
    }
}

// 关闭帮助面板
function closeHelp() {
    const helpPanel = document.getElementById('helpPanel');
    helpPanel.style.display = 'none';
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TimerApp();
});

// 导出功能
function exportSchedule() {
    // 这里可以实现导出为图片的功能
    alert('导出功能演示 - 在真实应用中会生成高质量的时间安排图片');
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('taskModal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
        
        const helpPanel = document.getElementById('helpPanel');
        if (helpPanel && helpPanel.style.display === 'flex') {
            helpPanel.style.display = 'none';
        }
    }
});