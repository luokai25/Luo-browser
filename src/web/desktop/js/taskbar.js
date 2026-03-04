// Luo Desktop - Taskbar Extensions

class TaskbarManager {
    static init() {
        this.setupStartMenu();
    }

    static setupStartMenu() {
        const startBtn = document.getElementById('start-btn');
        const startMenu = document.getElementById('start-menu');
        const appSearch = document.getElementById('app-search');

        // Toggle start menu
        startBtn.addEventListener('click', () => {
            startMenu.classList.toggle('hidden');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!startBtn.contains(e.target) && !startMenu.contains(e.target)) {
                startMenu.classList.add('hidden');
            }
        });

        // Search functionality
        if (appSearch) {
            appSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.start-app').forEach(app => {
                    const text = app.textContent.toLowerCase();
                    app.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }

        // Start menu app clicks
        document.querySelectorAll('.start-app').forEach(app => {
            app.addEventListener('click', () => {
                const appName = app.dataset.app;
                window.luoDesktop.openApp(appName);
                startMenu.classList.add('hidden');
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    TaskbarManager.init();
});
