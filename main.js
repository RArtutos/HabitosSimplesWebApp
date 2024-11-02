class HabitTracker {
  constructor() {
    this.habits = JSON.parse(localStorage.getItem('habits')) || [];
    this.currentFilter = 'todos';
    this.initElements();
    this.init();
    this.setupOfflineDetection();
    this.setupThemeSwitcher();
  }

  initElements() {
    this.habitInput = document.getElementById('habitInput');
    this.categorySelect = document.getElementById('categorySelect');
    this.addButton = document.getElementById('addHabit');
    this.habitList = document.getElementById('habitList');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.offlineNotification = document.getElementById('offlineNotification');
    this.themeButtons = document.querySelectorAll('.theme-btn');
    this.statsElements = {
      totalHabits: document.getElementById('totalHabits'),
      completedToday: document.getElementById('completedToday'),
      currentStreak: document.getElementById('currentStreak')
    };
  }

  setupThemeSwitcher() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.themeButtons.forEach(btn => {
      if (btn.dataset.theme === savedTheme) {
        btn.classList.add('active');
      }
      btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
    });
  }

  changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.offlineNotification.classList.remove('show');
    });

    window.addEventListener('offline', () => {
      this.offlineNotification.classList.add('show');
    });

    if (!navigator.onLine) {
      this.offlineNotification.classList.add('show');
    }
  }

  init() {
    this.addButton.addEventListener('click', () => this.addHabit());
    this.habitInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addHabit();
    });

    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.dataset.filter;
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderHabits();
      });
    });

    this.checkDayChange();
    this.renderHabits();
    this.updateStats();
  }

  checkDayChange() {
    const lastCheck = localStorage.getItem('lastCheck');
    const today = new Date().toDateString();

    if (lastCheck !== today) {
      this.habits = this.habits.map(habit => {
        if (!habit.completed) {
          habit.streak = 0;
        }
        habit.completed = false;
        return habit;
      });
      this.saveHabits();
      localStorage.setItem('lastCheck', today);
    }
  }

  addHabit() {
    const habitText = this.habitInput.value.trim();
    if (!habitText) return;

    const habit = {
      id: Date.now(),
      text: habitText,
      category: this.categorySelect.value,
      completed: false,
      streak: 0,
      createdAt: new Date()
    };

    this.habits.push(habit);
    this.saveHabits();
    this.renderHabits();
    this.updateStats();
    this.habitInput.value = '';
  }

  toggleHabit(id) {
    this.habits = this.habits.map(habit => {
      if (habit.id === id) {
        const newCompleted = !habit.completed;
        return {
          ...habit,
          completed: newCompleted,
          streak: newCompleted ? habit.streak + 1 : habit.streak
        };
      }
      return habit;
    });
    this.saveHabits();
    this.renderHabits();
    this.updateStats();
  }

  deleteHabit(id) {
    this.habits = this.habits.filter(habit => habit.id !== id);
    this.saveHabits();
    this.renderHabits();
    this.updateStats();
  }

  updateStats() {
    const stats = {
      total: this.habits.length,
      completedToday: this.habits.filter(h => h.completed).length,
      maxStreak: Math.max(...this.habits.map(h => h.streak), 0)
    };

    this.statsElements.totalHabits.textContent = stats.total;
    this.statsElements.completedToday.textContent = stats.completedToday;
    this.statsElements.currentStreak.textContent = stats.maxStreak;
  }

  saveHabits() {
    localStorage.setItem('habits', JSON.stringify(this.habits));
  }

  renderHabits() {
    const filteredHabits = this.currentFilter === 'todos'
      ? this.habits
      : this.habits.filter(h => h.category === this.currentFilter);

    this.habitList.innerHTML = filteredHabits
      .map(habit => `
        <li class="habit-item ${habit.completed ? 'completed' : ''}" data-id="${habit.id}">
          <div class="habit-checkbox ${habit.completed ? 'checked' : ''}"
               onclick="habitTracker.toggleHabit(${habit.id})">
          </div>
          <div class="habit-content">
            <span class="habit-text">${this.escapeHtml(habit.text)}</span>
            <span class="habit-category ${habit.category}">${habit.category}</span>
            <span class="habit-streak">🔥 Racha: ${habit.streak} días</span>
          </div>
          <button class="delete-btn" onclick="habitTracker.deleteHabit(${habit.id})">×</button>
        </li>
      `)
      .join('');
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

window.habitTracker = new HabitTracker();