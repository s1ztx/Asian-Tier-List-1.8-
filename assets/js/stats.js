/* ============================================================
   STATS PAGE LOGIC
   ============================================================ */

(function() {
    'use strict';
    
    // ============================================================
    // STATE
    // ============================================================
    let currentGamemode = 'global';
    let statsInterval = null;
    
    // ============================================================
    // DOM REFS
    // ============================================================
    const searchInput = document.getElementById('stats-search');
    const searchBtn = document.getElementById('stats-search-btn');
    const statsContent = document.getElementById('stats-content');
    const statsPlaceholder = document.getElementById('stats-placeholder');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const leaderboardTable = document.getElementById('leaderboard-table');
    
    // ============================================================
    // HELPERS
    // ============================================================
    function getTierColor(tier) {
        return window.ATL_DATA.TIER_COLORS[tier] || '#94a3b8';
    }
    
    function getSkinUrl(username, size) {
        return window.ATL_DATA.getSkinUrl(username, size || 100);
    }
    
    function formatStat(num) {
        return num !== undefined && num !== null ? num : 'N/A';
    }
    
    function getGamemodeLabel(id) {
        return window.ATL_DATA.getGamemodeLabel(id);
    }
    
    function getGamemodeIcon(id) {
        return window.ATL_DATA.getGamemodeIcon(id);
    }
    
    // ============================================================
    // SERVER STATUS
    // ============================================================
    async function updateServerStatus() {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        const online = document.getElementById('players-online');
        const uptime = document.getElementById('uptime');
        const version = document.getElementById('server-version');
        
        try {
            const status = await window.FROST_STATS.getServerStatus();
            
            if (status.online) {
                dot.className = 'status-dot online';
                text.textContent = 'Online';
                online.textContent = status.players_online || 0;
                uptime.textContent = status.uptime || '0d 0h';
                version.textContent = status.version || '1.8.8';
            } else {
                dot.className = 'status-dot offline';
                text.textContent = 'Offline';
                online.textContent = '0';
                uptime.textContent = '--';
                version.textContent = '--';
            }
        } catch (error) {
            dot.className = 'status-dot offline';
            text.textContent = 'Offline';
            online.textContent = '0';
            uptime.textContent = '--';
            version.textContent = '--';
        }
    }
    
    // ============================================================
    // PLAYER STATS
    // ============================================================
    async function displayPlayerStats(username) {
        try {
            // Show loading
            statsContent.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading stats for ${username}...</p>
                </div>
            `;
            
            // Fetch data
            const player = await window.FROST_STATS.getPlayerData(username);
            
            // Check if player exists
            if (!player || player.stats.games === 0) {
                statsContent.innerHTML = `
                    <div class="error-message">
                        <div class="icon">❌</div>
                        <p>Player "${username}" not found on Frost Practice</p>
                        <p style="font-size: 0.85rem; margin-top: 8px; color: var(--color-text-secondary)">
                            Try: sheluvs1ztx, shizeen, svynzz
                        </p>
                    </div>
                `;
                return;
            }
            
            const tierColor = getTierColor(player.overall);
            const gamemodes = window.ATL_DATA.GAMEMODES;
            
            let gamemodeHTML = '';
            gamemodes.forEach(gm => {
                const data = player.gamemodes?.[gm.id] || { tier: 'N/A', wins: 0, losses: 0, elo: 0 };
                const tier = data.tier || 'N/A';
                const color = getTierColor(tier);
                gamemodeHTML += `
                    <div class="gm-stat">
                        <div class="gm-name">${gm.icon} ${gm.label}</div>
                        <div class="gm-detail">
                            <span>${formatStat(data.wins)}W - ${formatStat(data.losses)}L</span>
                            <span class="tier-badge" style="color: ${color}">${tier}</span>
                            <span>${formatStat(data.elo)} ELO</span>
                        </div>
                    </div>
                `;
            });
            
            statsContent.innerHTML = `
                <div class="player-stats-display">
                    <div class="skin-large">
                        <img src="${player.skin || getSkinUrl(player.username)}" 
                             alt="Minecraft skin of ${player.username}" 
                             loading="lazy"
                             onerror="this.src='${window.ATL_DATA.getSkinFallback()}'">
                    </div>
                    <div class="info">
                        <h3>${player.username}</h3>
                        <div class="discord">${player.discord || 'Not linked'}</div>
                        <div class="tier" style="color: ${tierColor}">${player.overall}</div>
                    </div>
                </div>
                
                <div class="stats-mini-grid">
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.wins)}</div>
                        <div class="label">Wins</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.losses)}</div>
                        <div class="label">Losses</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.kd)}</div>
                        <div class="label">K/D</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.elo)}</div>
                        <div class="label">ELO</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.games)}</div>
                        <div class="label">Games</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.winRate)}%</div>
                        <div class="label">Win Rate</div>
                    </div>
                    <div class="mini-stat">
                        <div class="num">${formatStat(player.stats.streak)}</div>
                        <div class="label">Streak</div>
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);">
                    <h3 style="font-size: 1rem; margin-bottom: 12px;">🎯 Gamemode Breakdown</h3>
                    <div class="gamemode-stats">${gamemodeHTML}</div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error displaying player stats:', error);
            statsContent.innerHTML = `
                <div class="error-message">
                    <div class="icon">❌</div>
                    <p>${error.message}</p>
                    <p style="font-size: 0.85rem; margin-top: 8px; color: var(--color-text-secondary)">
                        Make sure Frost Practice server is running at ${window.FROST_STATS.CONFIG.baseUrl}
                    </p>
                </div>
            `;
        }
    }
    
    // ============================================================
    // LEADERBOARD
    // ============================================================
    async function loadLeaderboard(gamemode = 'global') {
        leaderboardLoading.style.display = 'block';
        leaderboardTable.style.display = 'none';
        
        try {
            const players = await window.FROST_STATS.getLeaderboard(gamemode);
            
            leaderboardLoading.style.display = 'none';
            
            if (!players || players.length === 0) {
                leaderboardBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; padding: 30px; color: var(--color-text-secondary);">
                            No players ranked in ${getGamemodeLabel(gamemode)} yet
                        </td>
                    </tr>
                `;
                leaderboardTable.style.display = 'table';
                return;
            }
            
            leaderboardBody.innerHTML = players.map((p, i) => {
                const rank = i + 1;
                let rankClass = 'rank';
                if (rank === 1) rankClass += ' top1';
                else if (rank === 2) rankClass += ' top2';
                else if (rank === 3) rankClass += ' top3';
                
                return `
                    <tr>
                        <td class="${rankClass}">#${rank}</td>
                        <td>
                            <div class="player-cell">
                                <div class="mini-skin">
                                    <img src="${getSkinUrl(p.username, 32)}" 
                                         alt="Minecraft skin of ${p.username}"
                                         loading="lazy"
                                         onerror="this.src='${window.ATL_DATA.getSkinFallback()}'">
                                </div>
                                <span class="name">${p.username}</span>
                            </div>
                        </td>
                        <td class="elo">${formatStat(p.elo)}</td>
                        <td>${formatStat(p.wins)}</td>
                        <td>${formatStat(p.losses)}</td>
                        <td>${formatStat(p.kd)}</td>
                    </tr>
                `;
            }).join('');
            
            leaderboardTable.style.display = 'table';
            
        } catch (error) {
            leaderboardLoading.style.display = 'none';
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 30px; color: var(--color-red);">
                        Failed to load leaderboard: ${error.message}
                    </td>
                </tr>
            `;
            leaderboardTable.style.display = 'table';
        }
    }
    
    // ============================================================
    // SEARCH LOGIC
    // ============================================================
    function searchStatsPlayer() {
        const query = searchInput.value.trim();
        if (!query) return;
        displayPlayerStats(query);
        searchInput.value = '';
    }
    
    function loadStatsExample(username) {
        searchInput.value = username;
        displayPlayerStats(username);
    }
    
    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchStatsPlayer();
    });
    
    searchBtn.addEventListener('click', searchStatsPlayer);
    
    // Example click handlers
    document.querySelectorAll('.example').forEach(el => {
        el.addEventListener('click', function() {
            loadStatsExample(this.textContent.trim());
        });
    });
    
    // Gamemode filter buttons
    document.querySelectorAll('#leaderboard-filter button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#leaderboard-filter button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentGamemode = this.dataset.gamemode;
            loadLeaderboard(currentGamemode);
        });
    });
    
    // ============================================================
    // INITIALIZATION
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        // Update server status
        updateServerStatus();
        
        // Load leaderboard
        loadLeaderboard('global');
        
        // Auto-load a player
        setTimeout(() => {
            loadStatsExample('sheluvs1ztx');
        }, 1000);
        
        // Refresh server status every 30 seconds
        statsInterval = setInterval(updateServerStatus, 30000);
    });
    
    // Cleanup interval on page unload
    window.addEventListener('beforeunload', function() {
        if (statsInterval) {
            clearInterval(statsInterval);
        }
    });
    
    // ============================================================
    // EXPOSE PUBLIC METHODS
    // ============================================================
    window.Stats = {
        searchPlayer: searchStatsPlayer,
        loadExample: loadStatsExample,
        loadLeaderboard: loadLeaderboard,
        updateServerStatus: updateServerStatus,
        displayPlayerStats: displayPlayerStats
    };
})();
