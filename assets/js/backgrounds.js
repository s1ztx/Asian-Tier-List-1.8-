/* ============================================================
   ASIAN TIER LIST — SESSION & DISCORD OAUTH
   ============================================================ */

window.ATL_SESSION = (function() {
    'use strict';
    
    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        // Your Cloudflare Worker URL (change this to your deployed worker)
        WORKER_URL: 'https://your-worker.workers.dev',
        // Discord OAuth client ID
        CLIENT_ID: '1518971939073429708',
        // Scopes needed
        SCOPES: 'identify guilds',
        // Redirect URI (must match your Worker's callback)
        REDIRECT_URI: window.location.origin + '/discord-callback.html',
        // KV store keys
        STORE_KEYS: {
            staff: 'staff',
            testers: 'testers',
            announcements: 'announcements',
            reviews: 'reviews',
            leaderboards: 'leaderboards',
            tier_log: 'tier_log',
            tickets: 'tickets',
            applications: 'applications',
            rules: 'rules',
            tier_config: 'tier_config'
        }
    };
    
    // ============================================================
    // STATE
    // ============================================================
    let currentSession = null;
    let storeCache = {};
    
    // ============================================================
    // ROLE HIERARCHY (from data.js)
    // ============================================================
    const ROLE_HIERARCHY = [
        'Guest',
        'Member',
        'Tester',
        'Senior Tester',
        'Testing Manager',
        'Owner',
        'Founder'
    ];
    
    function getRoleIndex(role) {
        const idx = ROLE_HIERARCHY.indexOf(role);
        return idx === -1 ? 0 : idx;
    }
    
    function hasAtLeast(role, minRole) {
        if (!minRole) return true;
        if (role === 'Founder') return true;
        return getRoleIndex(role) >= getRoleIndex(minRole);
    }
    
    // ============================================================
    // STORAGE HELPERS (localStorage + KV fallback)
    // ============================================================
    function storageKey(key) {
        return 'atl_' + key;
    }
    
    function loadLocal(key, fallback) {
        try {
            const data = localStorage.getItem(storageKey(key));
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            return fallback;
        }
    }
    
    function saveLocal(key, data) {
        try {
            localStorage.setItem(storageKey(key), JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', key, e);
        }
    }
    
    // ============================================================
    // KV STORE API (via Cloudflare Worker)
    // ============================================================
    async function loadStore(key, fallback) {
        try {
            // Check cache first
            if (storeCache[key] !== undefined) {
                return storeCache[key];
            }
            
            // Try to load from KV via Worker
            const response = await fetch(`${CONFIG.WORKER_URL}/api/store/${key}`);
            if (response.ok) {
                const data = await response.json();
                storeCache[key] = data;
                saveLocal(key, data);
                return data;
            }
            
            // Fallback to localStorage
            const local = loadLocal(key, fallback);
            storeCache[key] = local;
            return local;
        } catch (e) {
            console.warn(`Failed to load store "${key}":`, e);
            const local = loadLocal(key, fallback);
            storeCache[key] = local;
            return local;
        }
    }
    
    async function saveStore(key, data) {
        try {
            // Save to KV via Worker
            const response = await fetch(`${CONFIG.WORKER_URL}/api/store/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Worker returned ${response.status}`);
            }
            
            // Update cache and localStorage
            storeCache[key] = data;
            saveLocal(key, data);
            return data;
        } catch (e) {
            console.warn(`Failed to save store "${key}":`, e);
            // Fallback: save to localStorage only
            saveLocal(key, data);
            storeCache[key] = data;
            return data;
        }
    }
    
    // ============================================================
    // DISCORD OAUTH
    // ============================================================
    function getOAuthURL() {
        const params = new URLSearchParams({
            client_id: CONFIG.CLIENT_ID,
            redirect_uri: CONFIG.REDIRECT_URI,
            response_type: 'code',
            scope: CONFIG.SCOPES
        });
        return `https://discord.com/api/oauth2/authorize?${params}`;
    }
    
    function loginWithDiscord() {
        // Redirect to Discord OAuth
        window.location.href = getOAuthURL();
    }
    
    // ============================================================
    // SESSION MANAGEMENT
    // ============================================================
    function getSession() {
        if (currentSession) return currentSession;
        
        // Try to load from localStorage
        const saved = loadLocal('session', null);
        if (saved && saved.authenticated && saved.expires > Date.now()) {
            currentSession = saved;
            return currentSession;
        }
        
        // Default guest session
        currentSession = {
            authenticated: false,
            role: 'Guest',
            user: { id: null, username: 'Guest', display: 'Guest', avatar: null },
            expires: null
        };
        return currentSession;
    }
    
    function setSession(sessionData) {
        currentSession = {
            ...sessionData,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        saveLocal('session', currentSession);
        
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('session-update', { detail: currentSession }));
    }
    
    function logout() {
        currentSession = {
            authenticated: false,
            role: 'Guest',
            user: { id: null, username: 'Guest', display: 'Guest', avatar: null },
            expires: null
        };
        saveLocal('session', currentSession);
        window.dispatchEvent(new CustomEvent('session-update', { detail: currentSession }));
        window.location.reload();
    }
    
    // ============================================================
    // HANDLE DISCORD CALLBACK
    // ============================================================
    async function handleCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) return;
        
        try {
            // Exchange code for token via Worker
            const response = await fetch(`${CONFIG.WORKER_URL}/api/auth/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, redirect_uri: CONFIG.REDIRECT_URI })
            });
            
            if (!response.ok) {
                throw new Error(`Auth failed: ${response.status}`);
            }
            
            const userData = await response.json();
            
            // Determine role (from Discord roles or default)
            let role = 'Member';
            if (userData.roles) {
                // Check for highest role
                const roleMap = {
                    'Founder': ['Founder'],
                    'Owner': ['Owner'],
                    'Testing Manager': ['Testing Manager'],
                    'Senior Tester': ['Senior Tester'],
                    'Tester': ['Tester']
                };
                
                for (const [roleName, discordRoles] of Object.entries(roleMap)) {
                    if (discordRoles.some(r => userData.roles.includes(r))) {
                        role = roleName;
                        break;
                    }
                }
            }
            
            // Build session
            const session = {
                authenticated: true,
                role: role,
                user: {
                    id: userData.id,
                    username: userData.username,
                    display: userData.global_name || userData.username,
                    avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
                    discriminator: userData.discriminator
                },
                discord: {
                    id: userData.id,
                    username: userData.username,
                    global_name: userData.global_name,
                    avatar: userData.avatar,
                    roles: userData.roles || []
                },
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            };
            
            setSession(session);
            
            // Redirect to home after successful login
            window.location.href = '/';
            
        } catch (error) {
            console.error('OAuth callback error:', error);
            // Show error message
            const errorEl = document.getElementById('auth-error');
            if (errorEl) {
                errorEl.textContent = 'Login failed. Please try again.';
                errorEl.style.display = 'block';
            }
        }
    }
    
    // ============================================================
    // AUTO-CHECK FOR CALLBACK
    // ============================================================
    // Check if we're on the callback page
    if (window.location.pathname.includes('discord-callback.html')) {
        handleCallback();
    }
    
    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        // Session
        current: getSession,
        set: setSession,
        logout: logout,
        loginWithDiscord: loginWithDiscord,
        
        // Roles
        hasAtLeast: hasAtLeast,
        getRoleIndex: getRoleIndex,
        ROLE_HIERARCHY: ROLE_HIERARCHY,
        
        // Store
        loadStore: loadStore,
        saveStore: saveStore,
        clearCache: () => { storeCache = {}; },
        
        // Config
        CONFIG: CONFIG,
        
        // OAuth URL (for debugging)
        getOAuthURL: getOAuthURL
    };
})();

// ============================================================
// EXPOSE TO GLOBAL
// ============================================================
window.ATL_SESSION = window.ATL_SESSION;

// ============================================================
// AUTO-INIT: Update UI on session change
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const session = window.ATL_SESSION.current();
    
    // Update login button if it exists
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && session.authenticated) {
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = window.ATL_SESSION.logout;
    }
});
