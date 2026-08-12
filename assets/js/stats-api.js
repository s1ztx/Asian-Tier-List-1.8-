/* ============================================================
   FROST PRACTICE STATS API INTEGRATION
   ============================================================ */

window.FROST_STATS = (function() {
    'use strict';
    
    // ============================================================
    // CONFIGURATION - CHANGE THIS TO YOUR SERVER
    // ============================================================
    const CONFIG = {
        // Your Frost Practice server address
        baseUrl: 'http://localhost:8080',
        // Or use your local IP for other devices:
        // baseUrl: 'http://192.168.1.100:8080',
        
        // API endpoints
        endpoints: {
            player: '/api/stats',
            leaderboard: '/api/leaderboard',
            server: '/api/server-status',
            tier: '/api/tier'
        },
        
        // Timeout in milliseconds
        timeout: 10000,
        
        // Cache TTL in milliseconds
        cacheTTL: 60000 // 1 minute
    };
    
    // ============================================================
    // CACHE
    // ============================================================
    const cache = new Map();
    
    function getCacheKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }
    
    function getCached(key) {
        const entry = cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CONFIG.cacheTTL) {
            cache.delete(key);
            return null;
        }
        return entry.data;
    }
    
    function setCache(key, data) {
        cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    // ============================================================
    // FETCH WITH TIMEOUT
    // ============================================================
    async function fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
    
    // ============================================================
    // API METHODS
    // ============================================================
    
    /**
     * Fetch player statistics from Frost Practice
     * @param {string} username - Minecraft username
     * @returns {Promise<Object>} Player stats
     */
    async function getPlayerStats(username) {
        const cacheKey = getCacheKey('player', { username });
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const url = `${CONFIG.baseUrl}${CONFIG.endpoints.player}?player=${encodeURIComponent(username)}`;
            const response = await fetchWithTimeout(url, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Player not found');
                }
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }
    
    /**
     * Fetch player tier information
     * @param {string} username - Minecraft username
     * @returns {Promise<Object>} Player tier data
     */
    async function getPlayerTier(username) {
        const cacheKey = getCacheKey('tier', { username });
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const url = `${CONFIG.baseUrl}${CONFIG.endpoints.tier}?player=${encodeURIComponent(username)}`;
            const response = await fetchWithTimeout(url, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching player tier:', error);
            return null;
        }
    }
    
    /**
     * Fetch leaderboard for a gamemode
     * @param {string} gamemode - 'global' or gamemode id
     * @returns {Promise<Array>} Leaderboard entries
     */
    async function getLeaderboard(gamemode = 'global') {
        const cacheKey = getCacheKey('leaderboard', { gamemode });
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const url = `${CONFIG.baseUrl}${CONFIG.endpoints.leaderboard}?gamemode=${encodeURIComponent(gamemode)}`;
            const response = await fetchWithTimeout(url, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
    
    /**
     * Fetch server status
     * @returns {Promise<Object>} Server status
     */
    async function getServerStatus() {
        const cacheKey = getCacheKey('server', {});
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const url = `${CONFIG.baseUrl}${CONFIG.endpoints.server}`;
            const response = await fetchWithTimeout(url, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching server status:', error);
            return { online: false, players_online: 0, uptime: '0h', version: 'Unknown' };
        }
    }
    
    /**
     * Get combined player data (stats + tier)
     * @param {string} username - Minecraft username
     * @returns {Promise<Object>} Combined player data
     */
    async function getPlayerData(username) {
        try {
            const [stats, tier] = await Promise.all([
                getPlayerStats(username),
                getPlayerTier(username)
            ]);
            
            return {
                username: stats.username || username,
                discord: stats.discord || `${username}#0000`,
                skin: `https://crafatar.com/avatars/${encodeURIComponent(username)}?size=100`,
                overall: tier?.overall || 'N/A',
                stats: {
                    wins: stats.wins || 0,
                    losses: stats.losses || 0,
                    kd: stats.kd || 0,
                    elo: stats.elo || 0,
                    games: stats.games || 0,
                    winRate: stats.winRate || 0,
                    streak: stats.streak || 0
                },
                gamemodes: tier?.gamemodes || {}
            };
        } catch (error) {
            console.error('Error fetching player data:', error);
            throw error;
        }
    }
    
    // ============================================================
    // CLEAR CACHE
    // ============================================================
    function clearCache() {
        cache.clear();
    }
    
    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        CONFIG: CONFIG,
        getPlayerStats: getPlayerStats,
        getPlayerTier: getPlayerTier,
        getLeaderboard: getLeaderboard,
        getServerStatus: getServerStatus,
        getPlayerData: getPlayerData,
        clearCache: clearCache
    };
})();

// ============================================================
// EXPOSE TO GLOBAL
// ============================================================
window.FROST_STATS = window.FROST_STATS;
