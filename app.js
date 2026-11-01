(function () {
  const STORAGE_KEY = 'nes_completion_tracker_v1';
  const SETTINGS_KEY = 'nes_completion_settings_v1';
  const ACTIVE_GAME_KEY = 'nes_active_game_v1';

  const games = window.NES_GAMES_DATA || [];

  // Load user progress: { [gameTitle]: { completed: boolean, date: string, notes: string, screenshot?: string } }
  let userProgress = {};
  let userSettings = { includeBorderline: false };
  let currentActiveGameTitle = '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) userProgress = JSON.parse(saved);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) userSettings = JSON.parse(savedSettings);
    currentActiveGameTitle = localStorage.getItem(ACTIVE_GAME_KEY) || '';
  } catch (e) {
    console.warn('Could not read localStorage:', e);
  }

  function syncToServer() {
    if (window.location.protocol.startsWith('http')) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAt: new Date().toISOString(),
          settings: userSettings,
          progress: userProgress
        })
      }).catch(() => {});
    }
  }

  function loadFromServer() {
    if (!window.location.protocol.startsWith('http')) return;
    fetch('/api/progress')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok && res.data && res.data.progress) {
          userProgress = res.data.progress;
          if (res.data.settings) {
            userSettings = res.data.settings;
            toggleBorderline.checked = !!userSettings.includeBorderline;
          }
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings));
          } catch (e) {}
          refreshAll();
        }
      })
      .catch(() => {});
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.warn('Could not save localStorage:', e);
    }
    syncToServer();
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
    syncToServer();
  }

  function setActiveGame(title) {
    currentActiveGameTitle = title || '';
    try {
      localStorage.setItem(ACTIVE_GAME_KEY, currentActiveGameTitle);
    } catch (e) {}
    if (nowPlayingLabel) {
      nowPlayingLabel.textContent = currentActiveGameTitle
        ? `Active Game: ${currentActiveGameTitle}`
        : 'Active Game: None selected';
    }
  }

  // DOM Elements
  const statCompleted = document.getElementById('statCompleted');
  const statRemaining = document.getElementById('statRemaining');
  const statNaCount = document.getElementById('statNaCount');
  const statPalCount = document.getElementById('statPalCount');
  const progressPercent = document.getElementById('progressPercent');
  const progressFill = document.getElementById('progressFill');
  const nowPlayingLabel = document.getElementById('nowPlayingLabel');

  const searchInput = document.getElementById('searchInput');
  const poolFilter = document.getElementById('poolFilter');
  const completionFilter = document.getElementById('completionFilter');
  const genreFilter = document.getElementById('genreFilter');
  const regionFilter = document.getElementById('regionFilter');
  const exclusionFilter = document.getElementById('exclusionFilter');
  const sortOrder = document.getElementById('sortOrder');
  const toggleBorderline = document.getElementById('toggleBorderline');
  const resultsSummary = document.getElementById('resultsSummary');
  const gamesTableBody = document.getElementById('gamesTableBody');

  const btnRandomGame = document.getElementById('btnRandomGame');
  const btnExportJson = document.getElementById('btnExportJson');
  const inputImportJson = document.getElementById('inputImportJson');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnDeckCaptureVictory = document.getElementById('btnDeckCaptureVictory');
  const btnSafeShutdownPi = document.getElementById('btnSafeShutdownPi');

  // Modal Elements
  const gameModal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalStatus = document.getElementById('modalStatus');
  const modalGenre = document.getElementById('modalGenre');
  const modalDevPub = document.getElementById('modalDevPub');
  const modalReleases = document.getElementById('modalReleases');
  const modalWinCond = document.getElementById('modalWinCond');
  const modalCompletedCheck = document.getElementById('modalCompletedCheck');
  const modalDateInput = document.getElementById('modalDateInput');
  const modalNotesInput = document.getElementById('modalNotesInput');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalSaveBtn = document.getElementById('modalSaveBtn');
  const modalLaunchTvBtn = document.getElementById('modalLaunchTvBtn');
  const modalCaptureVictoryBtn = document.getElementById('modalCaptureVictoryBtn');

  let activeModalGame = null;
  let currentFilteredGames = [];

  // Initialize dynamic filter options
  function initFilters() {
    toggleBorderline.checked = !!userSettings.includeBorderline;
    setActiveGame(currentActiveGameTitle);

    const genres = Array.from(new Set(games.map((g) => g.genre))).sort();
    genres.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      genreFilter.appendChild(opt);
    });

    const exclCats = Array.from(
      new Set(games.map((g) => g.exclusion_category).filter(Boolean))
    ).sort();
    exclCats.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      exclusionFilter.appendChild(opt);
    });
  }

  function isGameCompleted(title) {
    return !!(userProgress[title] && userProgress[title].completed);
  }

  function isInTargetPool(game) {
    if (game.status === 'Included') return true;
    if (game.status === 'Borderline' && userSettings.includeBorderline) return true;
    return false;
  }

  function updateDashboardStats() {
    const targetGames = games.filter(isInTargetPool);
    const completedTarget = targetGames.filter((g) => isGameCompleted(g.title));

    const total = targetGames.length;
    const comp = completedTarget.length;
    const rem = total - comp;
    const pct = total > 0 ? ((comp / total) * 100).toFixed(2) : '0.00';

    statCompleted.textContent = `${comp} / ${total}`;
    statRemaining.textContent = `${rem} game${rem === 1 ? '' : 's'} remaining`;
    progressPercent.textContent = `${pct}%`;
    progressFill.style.width = `${pct}%`;

    const naPool = targetGames.filter(
      (g) => g.region === 'NA' || g.region === 'NA + PAL'
    );
    const naComp = naPool.filter((g) => isGameCompleted(g.title)).length;
    statNaCount.textContent = `${naComp} / ${naPool.length}`;

    const palPool = targetGames.filter((g) => g.region.startsWith('PAL'));
    const palComp = palPool.filter((g) => isGameCompleted(g.title)).length;
    statPalCount.textContent = `${palComp} / ${palPool.length}`;
  }

  function cleanSortTitle(title) {
    const t = String(title || '').toLowerCase();
    if (t.startsWith('the ')) return t.slice(4);
    if (t.startsWith('a ')) return t.slice(2);
    return t;
  }

  function getFilteredGames() {
    const query = searchInput.value.trim().toLowerCase();
    const pool = poolFilter.value;
    const compState = completionFilter.value;
    const genre = genreFilter.value;
    const region = regionFilter.value;
    const excl = exclusionFilter.value;
    const sortMode = sortOrder ? sortOrder.value : 'release-asc';

    const filtered = games.filter((g) => {
      if (pool === 'target') {
        if (!isInTargetPool(g)) return false;
      } else if (pool !== 'all') {
        if (g.status !== pool) return false;
      }

      const done = isGameCompleted(g.title);
      if (compState === 'completed' && !done) return false;
      if (compState === 'incomplete' && done) return false;

      if (genre !== 'all' && g.genre !== genre) return false;

      if (region === 'PAL-All') {
        if (!g.region.startsWith('PAL')) return false;
      } else if (region !== 'all' && g.region !== region) {
        return false;
      }

      if (excl !== 'all' && g.exclusion_category !== excl) return false;

      if (query) {
        const userNote = (userProgress[g.title] && userProgress[g.title].notes) || '';
        const haystack = [
          g.title,
          g.alternate_titles,
          g.publisher,
          g.developer,
          g.genre,
          g.win_condition,
          g.exclusion_category || '',
          g.release_date || '',
          String(g.year),
          userNote
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortMode === 'release-asc') return a.id - b.id;
      if (sortMode === 'release-desc') return b.id - a.id;
      const ta = cleanSortTitle(a.title);
      const tb = cleanSortTitle(b.title);
      if (sortMode === 'title-asc') return ta.localeCompare(tb);
      if (sortMode === 'title-desc') return tb.localeCompare(ta);
      return a.id - b.id;
    });

    return filtered;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTable() {
    currentFilteredGames = getFilteredGames();
    resultsSummary.textContent = `Showing ${currentFilteredGames.length} game${
      currentFilteredGames.length === 1 ? '' : 's'
    }`;

    const rowsHtml = currentFilteredGames
      .map((g, idx) => {
        const prog = userProgress[g.title] || {};
        const done = !!prog.completed;

        let statusBadgeClass = 'badge-included';
        if (g.status === 'Borderline') statusBadgeClass = 'badge-borderline';
        if (g.status === 'Excluded') statusBadgeClass = 'badge-excluded';

        const regionBadgeClass = g.region.startsWith('PAL')
          ? 'badge-pal'
          : 'badge-region';

        const altHtml = g.alternate_titles
          ? `<div class="alt-title">Also known as: ${escapeHtml(g.alternate_titles)}</div>`
          : '';

        const exclSubHtml = g.exclusion_category
          ? `<div class="meta-sub" style="color: #e3b341;">${escapeHtml(
              g.exclusion_category
            )}</div>`
          : '';

        const dateHtml =
          done && prog.date
            ? `<div class="completed-date-badge">✓ ${escapeHtml(prog.date)}</div>`
            : '';

        const noteHtml = prog.notes
          ? `<div class="user-note-preview">📝 ${escapeHtml(prog.notes)}</div>`
          : '';

        const shotHtml = prog.screenshot
          ? `<a href="${escapeHtml(prog.screenshot)}" target="_blank" title="View Captured Victory Screen"><img src="${escapeHtml(
              prog.screenshot
            )}" alt="End Screen" class="screenshot-thumb" /></a>`
          : '';

        return `
          <tr class="${done ? 'row-completed' : ''}" data-title="${escapeHtml(g.title)}">
            <td class="check-cell">
              <input
                type="checkbox"
                class="complete-checkbox"
                data-action="toggle-check"
                data-title="${escapeHtml(g.title)}"
                ${done ? 'checked' : ''}
                title="Mark ${escapeHtml(g.title)} as completed"
              />
            </td>
            <td style="font-family: var(--font-mono); color: var(--text-muted);">${idx + 1}</td>
            <td class="game-title-cell">
              <div class="game-title-text">${escapeHtml(g.title)}</div>
              ${altHtml}
              <div class="meta-sub">${escapeHtml(g.publisher)} (${escapeHtml(
          g.developer
        )})</div>
              ${dateHtml}
            </td>
            <td>
              <span class="badge ${statusBadgeClass}">${escapeHtml(g.status)}</span>
              ${exclSubHtml}
            </td>
            <td>
              <span class="badge ${regionBadgeClass}">${escapeHtml(g.region)}</span>
              <div class="meta-sub" style="font-family: var(--font-mono);">${escapeHtml(
                g.release_date || String(g.year)
              )}</div>
            </td>
            <td>${escapeHtml(g.genre)}</td>
            <td class="win-cond-cell">
              <div>${escapeHtml(g.win_condition)}</div>
              ${noteHtml}
              ${shotHtml}
            </td>
            <td>
              <div class="action-cell">
                <button
                  class="btn btn-primary"
                  data-action="launch-tv"
                  data-title="${escapeHtml(g.title)}"
                  title="Launch ${escapeHtml(g.title)} on the Samsung Frame TV"
                >
                  ▶ TV
                </button>
                <button
                  class="btn"
                  data-action="open-modal"
                  data-title="${escapeHtml(g.title)}"
                >
                  Log
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    gamesTableBody.innerHTML =
      rowsHtml ||
      `<tr><td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">No games match your current filters.</td></tr>`;
  }

  function refreshAll() {
    updateDashboardStats();
    renderTable();
  }

  // Launch Game on TV via pi_server.py
  function launchGameOnTv(title) {
    const game = games.find((g) => g.title === title);
    if (!game) return;
    setActiveGame(game.title);

    if (!window.location.protocol.startsWith('http')) {
      alert(
        `Active game set to "${game.title}".\n(Run ./pi_server.py on the Raspberry Pi to enable direct TV ROM launching.)`
      );
      return;
    }

    fetch('/api/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: game.title,
        alternate_titles: game.alternate_titles || ''
      })
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) {
          alert(`Could not launch ROM: ${res.error}`);
        }
      })
      .catch(() => {
        alert('Could not reach Raspberry Pi companion server (/api/launch).');
      });
  }

  // Capture Victory End Screen via pi_server.py & Mark Completed
  function captureVictoryScreen(title) {
    const targetTitle = title || currentActiveGameTitle;
    if (!targetTitle) {
      alert('Select or launch a game first (or open a game log modal) before capturing its end screen!');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const existing = userProgress[targetTitle] || {};

    if (!window.location.protocol.startsWith('http')) {
      userProgress[targetTitle] = {
        ...existing,
        completed: true,
        date: existing.date || today
      };
      saveProgress();
      refreshAll();
      alert(`Marked "${targetTitle}" as Completed! (Run ./pi_server.py on the Pi to also grab a RetroArch PNG screenshot.)`);
      return;
    }

    fetch('/api/capture-victory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: targetTitle })
    })
      .then((r) => r.json())
      .then((res) => {
        userProgress[targetTitle] = {
          ...existing,
          completed: true,
          date: existing.date || (res && res.date) || today,
          screenshot: (res && res.screenshot) || existing.screenshot || ''
        };
        saveProgress();
        refreshAll();
        if (activeModalGame && activeModalGame.title === targetTitle) {
          closeGameModal();
        }
      })
      .catch(() => {
        userProgress[targetTitle] = {
          ...existing,
          completed: true,
          date: existing.date || today
        };
        saveProgress();
        refreshAll();
      });
  }

  // Send RetroArch UDP Command
  function sendRetroArchCommand(cmd) {
    if (!window.location.protocol.startsWith('http')) {
      alert(`RetroArch UDP Command "${cmd}" requires running ./pi_server.py on the Raspberry Pi.`);
      return;
    }
    fetch('/api/retroarch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    }).catch(() => {});
  }

  // Event Delegation for Table
  gamesTableBody.addEventListener('click', (e) => {
    const target = e.target;
    const action = target.getAttribute('data-action');
    const title = target.getAttribute('data-title');
    if (!action || !title) return;

    if (action === 'toggle-check') {
      const checked = target.checked;
      const existing = userProgress[title] || {};
      const today = new Date().toISOString().slice(0, 10);
      if (checked) setActiveGame(title);
      userProgress[title] = {
        ...existing,
        completed: checked,
        date: checked ? existing.date || today : existing.date || ''
      };
      saveProgress();
      refreshAll();
    } else if (action === 'open-modal') {
      openGameModal(title);
    } else if (action === 'launch-tv') {
      launchGameOnTv(title);
    }
  });

  // Touchscreen Deck Buttons
  document.querySelectorAll('[data-ra-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sendRetroArchCommand(btn.getAttribute('data-ra-cmd'));
    });
  });

  if (btnDeckCaptureVictory) {
    btnDeckCaptureVictory.addEventListener('click', () => {
      captureVictoryScreen(currentActiveGameTitle);
    });
  }

  if (btnSafeShutdownPi) {
    btnSafeShutdownPi.addEventListener('click', () => {
      if (confirm('Safely exit RetroArch and shut down the Raspberry Pi 3B now?')) {
        fetch('/api/shutdown', { method: 'POST' }).catch(() => {});
      }
    });
  }

  function openGameModal(title) {
    const game = games.find((g) => g.title === title);
    if (!game) return;
    activeModalGame = game;
    setActiveGame(game.title);

    const prog = userProgress[game.title] || {};
    modalTitle.textContent = game.title;
    modalSubtitle.textContent = game.alternate_titles
      ? `Alternate / Regional Title: ${game.alternate_titles}`
      : `Catalog ID #${game.id}`;

    modalStatus.textContent = game.exclusion_category
      ? `${game.status} (${game.exclusion_category})`
      : game.status;
    modalGenre.textContent = game.genre;
    modalDevPub.textContent = `${game.developer} / ${game.publisher}`;

    const relParts = [];
    if (game.na_release) relParts.push(`NA: ${game.na_release}`);
    if (game.pal_release) relParts.push(`PAL: ${game.pal_release}`);
    modalReleases.textContent = relParts.join('  ·  ') || String(game.year);
    modalWinCond.textContent = game.win_condition;

    modalCompletedCheck.value = prog.completed ? 'true' : 'false';
    modalDateInput.value = prog.date || new Date().toISOString().slice(0, 10);
    modalNotesInput.value = prog.notes || '';

    gameModal.classList.remove('hidden');
  }

  function closeGameModal() {
    gameModal.classList.add('hidden');
    activeModalGame = null;
  }

  modalCloseBtn.addEventListener('click', closeGameModal);
  modalCancelBtn.addEventListener('click', closeGameModal);
  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) closeGameModal();
  });

  if (modalLaunchTvBtn) {
    modalLaunchTvBtn.addEventListener('click', () => {
      if (activeModalGame) launchGameOnTv(activeModalGame.title);
    });
  }

  if (modalCaptureVictoryBtn) {
    modalCaptureVictoryBtn.addEventListener('click', () => {
      if (activeModalGame) captureVictoryScreen(activeModalGame.title);
    });
  }

  modalSaveBtn.addEventListener('click', () => {
    if (!activeModalGame) return;
    const isComp = modalCompletedCheck.value === 'true';
    const existing = userProgress[activeModalGame.title] || {};
    userProgress[activeModalGame.title] = {
      ...existing,
      completed: isComp,
      date: isComp ? modalDateInput.value : '',
      notes: modalNotesInput.value.trim()
    };
    saveProgress();
    closeGameModal();
    refreshAll();
  });

  // Filter Event Listeners
  [
    searchInput,
    poolFilter,
    completionFilter,
    genreFilter,
    regionFilter,
    exclusionFilter,
    sortOrder
  ].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderTable);
    el.addEventListener('change', renderTable);
  });

  toggleBorderline.addEventListener('change', () => {
    userSettings.includeBorderline = toggleBorderline.checked;
    saveSettings();
    refreshAll();
  });

  // Random Unbeaten Game Picker
  btnRandomGame.addEventListener('click', () => {
    const unbeatenInView = currentFilteredGames.filter(
      (g) => !isGameCompleted(g.title) && g.status !== 'Excluded'
    );
    const pool = unbeatenInView.length
      ? unbeatenInView
      : games.filter((g) => isInTargetPool(g) && !isGameCompleted(g.title));

    if (!pool.length) {
      alert('No unbeaten games remaining in this view!');
      return;
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    openGameModal(chosen.title);
  });

  // Export Progress JSON
  btnExportJson.addEventListener('click', () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: userSettings,
      progress: userProgress
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nes-completion-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import Progress JSON
  inputImportJson.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && parsed.progress) {
          userProgress = parsed.progress;
          if (parsed.settings) {
            userSettings = parsed.settings;
            toggleBorderline.checked = !!userSettings.includeBorderline;
            saveSettings();
          }
          saveProgress();
          refreshAll();
        }
      } catch (err) {
        alert('Invalid progress JSON file.');
      }
    };
    reader.readAsText(file);
  });

  // Export Filtered View to CSV
  btnExportCsv.addEventListener('click', () => {
    const headers = [
      'ID',
      'Title',
      'Alternate Titles',
      'Status',
      'Completed',
      'Completion Date',
      'Genre',
      'Region',
      'Year',
      'Publisher',
      'Developer',
      'Exclusion Category',
      'Win Condition',
      'Personal Notes',
      'Screenshot'
    ];
    const escapeCsv = (val) => {
      const s = val == null ? '' : String(val);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [headers.join(',')];
    currentFilteredGames.forEach((g) => {
      const prog = userProgress[g.title] || {};
      lines.push(
        [
          g.id,
          g.title,
          g.alternate_titles,
          g.status,
          prog.completed ? 'Yes' : 'No',
          prog.date || '',
          g.genre,
          g.region,
          g.year,
          g.publisher,
          g.developer,
          g.exclusion_category || '',
          g.win_condition,
          prog.notes || '',
          prog.screenshot || ''
        ]
          .map(escapeCsv)
          .join(',')
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nes-games-filtered-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  initFilters();
  refreshAll();
  loadFromServer();
})();
