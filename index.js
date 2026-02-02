(function () {
    'use strict';

    /**
     * ZWECK:
     * Hauptlogik für das Pauker-Tool im lokalen Offline-Modus.
     * Nutzt die 'app_index.js' für die Struktur und lädt JSONs direkt.
     */

    // --- 1. Global Setup & State ---
    const THEME_KEY = 'globalTheme_v1';
    const STATE_KEY = 'paukerAppState_v1';

    // UI References
    const themeToggleApp = document.getElementById('theme-toggle-app');
    const menuBtn = document.getElementById('menu-tree-btn');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const viewTitleEl = document.getElementById('view-title');
    const viewPathEl = document.getElementById('view-path');
    const viewBodyEl = document.getElementById('view-body');
    const contentEl = document.querySelector('.content');
    const contentHeader = document.getElementById('content-header');
    const treeRootEl = document.getElementById('tree-root');
    const drawerTitleEl = document.getElementById('drawer-title');
    const drawerResizer = document.getElementById('drawer-resizer');
    const treeDrawer = document.getElementById('tree-drawer');

    // App State
    let appState = {
        selectedId: null,
        openedIds: [],
        drawerOpen: false,
        drawerWidth: 320
    };
    let rootTree = [];
    let rootName = 'Database';

    // --- 2. Theme Logic ---
    function applyTheme(theme) {
        const rootEl = document.documentElement;
        if (theme === 'light') {
            rootEl.classList.add('theme-light');
            themeToggleApp.textContent = '☀️';
        } else {
            rootEl.classList.remove('theme-light');
            themeToggleApp.textContent = '🌙';
        }

        // Update iframe if exists
        const iframe = document.querySelector('iframe.game-iframe');
        if (iframe && iframe.contentDocument) {
            if (theme === 'light') iframe.contentDocument.documentElement.classList.add('theme-light');
            else iframe.contentDocument.documentElement.classList.remove('theme-light');
        }
    }

    function initTheme() {
        let stored = localStorage.getItem(THEME_KEY);
        const initial = (stored === 'light' || stored === 'dark') ? stored : 'dark';
        applyTheme(initial);
    }

    function toggleTheme() {
        const isLight = document.documentElement.classList.contains('theme-light');
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    }

    // --- 3. App Logic ---
    function init() {
        loadAppState();
        initTheme();

        // Event Listeners
        themeToggleApp.addEventListener('click', toggleTheme);
        menuBtn.onclick = toggleDrawer;
        drawerBackdrop.onclick = () => setDrawer(false);

        initResizer();
        applyDrawerState();
        initLocalApp();
    }

    function loadAppState() {
        try {
            const raw = localStorage.getItem(STATE_KEY);
            if (raw) Object.assign(appState, JSON.parse(raw));
        } catch (_) { }
    }

    function saveAppState() {
        localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    }

    function toggleDrawer() {
        setDrawer(!appState.drawerOpen);
    }

    function setDrawer(isOpen) {
        appState.drawerOpen = isOpen;
        saveAppState();
        applyDrawerState();
    }

    function applyDrawerState() {
        if (appState.drawerWidth) {
            treeDrawer.style.setProperty('--drawer-width', appState.drawerWidth + 'px');
        }

        if (appState.drawerOpen) {
            document.getElementById('app-view').classList.add('tree-open');
            menuBtn.classList.add('active');
            drawerBackdrop.classList.add('active');
        } else {
            document.getElementById('app-view').classList.remove('tree-open');
            menuBtn.classList.remove('active');
            drawerBackdrop.classList.remove('active');
        }
    }

    function initResizer() {
        if (!drawerResizer) return;
        let isResizing = false;

        drawerResizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            drawerResizer.classList.add('resizing');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 200) newWidth = 200;
            if (newWidth > window.innerWidth * 0.8) newWidth = window.innerWidth * 0.8;
            appState.drawerWidth = newWidth;
            treeDrawer.style.setProperty('--drawer-width', newWidth + 'px');
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                drawerResizer.classList.remove('resizing');
                saveAppState();
            }
        });
    }

    async function initLocalApp() {
        // Load structure from window.DATABASE_INDEX (loaded via app_index.js script tag)
        rootTree = window.DATABASE_INDEX || [];
        drawerTitleEl.textContent = rootName;

        treeRootEl.innerHTML = '';
        buildTreeHelper(treeRootEl, rootTree, 0);

        // Initial View
        viewTitleEl.textContent = 'Bereit';
        viewPathEl.textContent = rootName;
        viewBodyEl.innerHTML = '<p style="padding:2rem; color:hsl(var(--txt-muted))">Bitte wähle eine Datei aus dem Menü.</p>';
        contentEl.classList.remove('full-screen');
        viewBodyEl.classList.remove('iframe-container');
        viewBodyEl.classList.add('card');

        applySelectedCss();

        // Restore last selected
        if (appState.selectedId) {
            const node = findNode(rootTree, appState.selectedId);
            if (node) selectNode(node.id);
        }
    }

    function buildTreeHelper(container, nodes, level) {
        nodes.forEach(node => {
            const div = document.createElement('div');
            div.className = 'tree-node';
            div.dataset.id = node.id;

            const isCollapsed = !appState.openedIds.includes(node.id);
            if (isCollapsed) div.classList.add('tree-node--collapsed');

            const row = document.createElement('div');
            row.className = 'tree-row';
            row.style.setProperty('--level', level);
            row.onclick = (e) => onNodeClick(e, node);

            if (node.isFolder) {
                const btn = document.createElement('button');
                btn.className = 'tree-toggle';
                btn.textContent = isCollapsed ? '▸' : '▾';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    toggleNode(div, node.id, btn);
                };
                row.appendChild(btn);
            } else {
                const sp = document.createElement('span');
                sp.className = 'tree-spacer';
                row.appendChild(sp);
            }

            const icon = document.createElement('span');
            icon.className = 'tree-icon';
            const isOpen = appState.openedIds.includes(node.id);
            icon.textContent = node.isFolder ? (isOpen ? "📂" : "📁") : (node.kind !== "json" ? "👁" : "🏋");
            row.appendChild(icon);

            const label = document.createElement('button');
            label.className = 'tree-label';
            label.textContent = node.name.replace(/\.[^.]+$/, '');
            row.appendChild(label);

            div.appendChild(row);

            const childCont = document.createElement('div');
            childCont.className = 'tree-children';
            if (node.isFolder && node.children) {
                buildTreeHelper(childCont, node.children, level + 1);
            }
            div.appendChild(childCont);
            container.appendChild(div);
        });
    }

    function toggleNode(div, id, btn) {
        const idx = appState.openedIds.indexOf(id);
        if (idx >= 0) {
            appState.openedIds.splice(idx, 1);
            div.classList.add('tree-node--collapsed');
            btn.textContent = '▸';
        } else {
            appState.openedIds.push(id);
            div.classList.remove('tree-node--collapsed');
            btn.textContent = '▾';
        }
        saveAppState();
        const icon = div.querySelector('.tree-icon');
        const node = findNode(rootTree, id);
        if (icon && node && node.isFolder) {
            icon.textContent = appState.openedIds.includes(id) ? '📂' : '📁';
        }
    }

    function onNodeClick(e, node) {
        if (node.isFolder) {
            const div = document.querySelector(`.tree-node[data-id="${node.id}"]`);
            if (div) {
                const btn = div.querySelector('.tree-toggle');
                toggleNode(div, node.id, btn);
            }
            return;
        }

        if (!node.isFolder && node.kind !== 'json' && node.kind !== 'pptx') {
            window.open(node.id, '_blank');
            return;
        }
        if (node.kind === 'json') {
            selectNode(node.id);
        }
    }

    function selectNode(id) {
        appState.selectedId = id;
        saveAppState();
        applySelectedCss();
        renderViewForId(id);
    }

    function applySelectedCss() {
        document.querySelectorAll('.tree-node').forEach(n => {
            if (n.dataset.id === appState.selectedId) n.classList.add('tree-node--selected');
            else n.classList.remove('tree-node--selected');
        });
    }

    function findNode(nodes, id) {
        for (const n of nodes) {
            if (n.id === id) return n;
            if (n.children) {
                const f = findNode(n.children, id);
                if (f) return f;
            }
        }
        return null;
    }

    function findPath(nodes, id, path = []) {
        for (const n of nodes) {
            const sub = [...path, n.name];
            if (n.id === id) return sub;
            if (n.children) {
                const f = findPath(n.children, id, sub);
                if (f) return f;
            }
        }
        return null;
    }

    function renderViewForId(id) {
        const node = findNode(rootTree, id);
        if (!node) return;

        viewTitleEl.textContent = node.name;
        const p = findPath(rootTree, id) || [node.name];
        viewPathEl.textContent = p.join(' / ');

        if (node.isFolder) {
            contentHeader.classList.remove('hidden');
            contentEl.classList.remove('full-screen');
            viewBodyEl.classList.remove('iframe-container');
            viewBodyEl.classList.add('card');
            const list = (node.children || []).map(c => `<li>${c.name}</li>`).join('');
            viewBodyEl.innerHTML = `<h3>Inhalt:</h3><ul>${list || '<li>Leer</li>'}</ul>`;
        } else {
            contentHeader.classList.add('hidden');
            contentEl.classList.add('full-screen');
            viewBodyEl.innerHTML = '';
            viewBodyEl.classList.remove('card');
            viewBodyEl.classList.add('iframe-container');

            if (node.kind === 'json') {
                // Daten im sessionStorage puffern, damit GameBase sie ohne Fetch findet
                if (node.data) {
                    sessionStorage.setItem('game_payload_' + node.id, JSON.stringify(node.data));
                }
                loadGame(node);
            } else {
                viewBodyEl.innerHTML = '<p style="padding:2rem">PDF Anzeige offline nicht direkt unterstützt. Bitte lade die Datei herunter.</p>';
            }
        }
    }

    function loadGame(node) {
        // Direct iframe loading
        const iframe = document.createElement('iframe');
        iframe.className = 'game-iframe';

        // Determine template from filename or game type
        // In this tool, all games are in /games/*.html
        // We need a mapping or a generic loader.
        // Assuming we use a generic loader or the filename hints at the game

        // Find game template from kind/name
        // For now, let's use a simple mapping or default to a loader
        const gameUrl = `games/game_loader.html?file=${encodeURIComponent(node.id)}`;
        // Actually, previous system had a more complex mapping in drive_interpreter
        // We'll restore a simplified version of that.

        iframe.src = `games/game_loader.html?file=${encodeURIComponent(node.id)}`;
        viewBodyEl.appendChild(iframe);

        // Handle theme sync
        iframe.onload = () => {
            const isLight = document.documentElement.classList.contains('theme-light');
            if (isLight) iframe.contentDocument.documentElement.classList.add('theme-light');
        };
    }

    // Initialize
    init();

})();
