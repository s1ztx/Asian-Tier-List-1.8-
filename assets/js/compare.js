/* ============================================================
   COMPARE PAGE LOGIC
   ============================================================ */

(function() {
    'use strict';
    
    // ============================================================
    // STATE
    // ============================================================
    let playerA = null;
    let playerB = null;
    let isLoading = false;
    
    // ============================================================
    // DOM REFS
    // ============================================================
    const searchInput = document.getElementById('compare-search');
    const searchBtn = document.getElementById('search-btn');
    const cardA = document.getElementById('player-a-card');
    const cardB = document.getElementById('player-b-card');
    
    // ============================================================
    // HELPERS
    // ============================================================
    function getTierColor(tier) {
        return window.ATL_DATA.TIER_COLORS[tier] || '#94a3b8';
    }
    
    function getSkinUrl(username) {
        return window.ATL_DATA.getSkinUrl(username, 100);
    }
    
    function formatStat(num) {
        return num !== undefined && num !== null ? num : 'N/A';
    }
    
    // ============================================================
    // RENDER FUNCTIONS
    // ============================================================
    function renderPlayerCard(cardElement, player, isBlue) {
        if (!player) {
            cardElement.innerHTML = `
                <div class="no-player">
                    <div class="icon">👤</div>
                    <p>Select a player to compare</p>
                </div>
            `;
            return;
        }
        
        const tierColor = getTierColor(player.overall);
        const gamemodes = window.ATL_DATA.GAMEMODES;
        
        let gamemodeHTML = '';
        gamemodes.forEach(gm => {
            const tier = player.gamemodes?.[gm.id]?.tier || 'N/A';
            const color = getTierColor(tier);
            gamemodeHTML += `
                <div class="gamemode-tier-row">
                    <span class="gm">${gm.icon} ${gm.label}</span>
                    <span class="tier" style="color: ${color}">${tier}</span>
                </div>
            `;
        });
        
        cardElement.innerHTML = `
            <div class="skin-display">
                <img src="${player.skin || getSkinUrl(player.username)}" 
                     alt="Minecraft skin of ${player.username}" 
                     loading="lazy"
                     onerror="this.src='${window.ATL_DATA.getSkinFallback()}'">
            </div>
            <div class="player-name">${player.username}</div>
            <div class="player-discord">${player.discord || 'Not linked'}</div>
            <div class="overall-tier" style="color: ${tierColor}">${player.overall}</div>
            
            <div class="stat-grid">
                <div class="stat-item"><span class="label">Wins</span><span class="value">${formatStat(player.stats?.wins)}</span></div>
                <div class="stat-item"><span class="label">Losses</span><span class="value">${formatStat(player.stats?.losses)}</span></div>
                <div class="stat-item"><span class="label">K/D</span><span class="value">${formatStat(player.stats?.kd)}</span></div>
                <div class="stat-item"><span class="label">ELO</span><span class="value">${formatStat(player.stats?.elo)}</span></div>
                <div class="stat-item"><span class="label">Games</span><span class="value">${formatStat(player.stats?.games)}</span></div>
                <div class="stat-item"><span class="label">Win Rate</span><span class="value">${formatStat(player.stats?.winRate)}%</span></div>
            </div>
            
            <div class="gamemode-tiers">
                ${gamemodeHTML}
            </div>
        `;
    }
    
    function showLoading(cardElement) {
        cardElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading player data...</p>
            </div>
        `;
    }
    
    function showError(cardElement, message) {
        cardElement.innerHTML = `
            <div class="error-message">
                <div class="icon">❌</div>
                <p>${message}</p>
                <p style="font-size: 0.85rem; margin-top: 8px; color: var(--color-text-secondary)">
                    Try: sheluvs1ztx, shizeen, svynzz
                </p>
            </div>
        `;
    }
    
    // ============================================================
    // SEARCH LOGIC
    // ============================================================
    async function searchPlayer() {
        if (isLoading) return;
        
        const query = searchInput.value.trim();
        if (!query) return;
        
        isLoading = true;
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        
        try {
            // Use the real Frost Practice API
            const player = await window.FROST_STATS.getPlayerData(query);
            
            // Check if player exists
            if (!player || player.stats.games === 0) {
                showError(cardA, `Player "${query}" not found on Frost Practice`);
                isLoading = false;
                searchBtn.disabled = false;
                searchBtn.textContent = 'Compare';
                return;
            }
            
            // Assign to slots
            if (!playerA) {
                playerA = player;
                renderPlayerCard(cardA, playerA, true);
            } else if (!playerB) {
                playerB = player;
                renderPlayerCard(cardB, playerB, false);
            } else {
                // Both filled - shift: B becomes A, new player becomes B
                playerA = playerB;
                playerB = player;
                renderPlayerCard(cardA, playerA, true);
                renderPlayerCard(cardB, playerB, false);
            }
            
            searchInput.value = '';
            
        } catch (error) {
            console.error('Search error:', error);
            showError(cardA, `Failed to fetch player data: ${error.message}`);
        }
        
        isLoading = false;
        searchBtn.disabled = false;
        searchBtn.textContent = 'Compare';
    }
    
    // ============================================================
    // LOAD EXAMPLE
    // ============================================================
    function loadExample(username) {
        searchInput.value = username;
        // Reset comparison
        playerA = null;
        playerB = null;
        renderPlayerCard(cardA, null);
        renderPlayerCard(cardB, null);
        searchPlayer();
    }
    
    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchPlayer();
    });
    
    searchBtn.addEventListener('click', searchPlayer);
    
    // Example click handlers
    document.querySelectorAll('.example').forEach(el => {
        el.addEventListener('click', function() {
            loadExample(this.textContent.trim());
        });
    });
    
    // ============================================================
    // AUTO-LOAD EXAMPLE ON START
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            loadExample('sheluvs1ztx');
        }, 500);
    });
    
    // ============================================================
    // EXPOSE PUBLIC METHODS
    // ============================================================
    window.Compare = {
        searchPlayer: searchPlayer,
        loadExample: loadExample,
        reset: function() {
            playerA = null;
            playerB = null;
            renderPlayerCard(cardA, null);
            renderPlayerCard(cardB, null);
        }
    };
})();
