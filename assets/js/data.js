/* ============================================================
   ASIAN TIER LIST — REFERENCE DATA
   ============================================================ */

window.ATL_DATA = (function() {
    'use strict';
    
    // ============================================================
    // TIER SYSTEM (Exact order high to low)
    // ============================================================
    const TIERS = [
        'S',
        'S-',
        'A+',
        'A',
        'A-',
        'B+',
        'B',
        'B-',
        'C+',
        'C',
        'C-',
        'D+',
        'D',
        'D-'
    ];
    
    const TIER_CSS_VAR = {
        'S': '--tier-S',
        'S-': '--tier-S-',
        'A+': '--tier-A-plus',
        'A': '--tier-A',
        'A-': '--tier-A-',
        'B+': '--tier-B-plus',
        'B': '--tier-B',
        'B-': '--tier-B-',
        'C+': '--tier-C-plus',
        'C': '--tier-C',
        'C-': '--tier-C-',
        'D+': '--tier-D-plus',
        'D': '--tier-D',
        'D-': '--tier-D-'
    };
    
    const TIER_COLORS = {
        'S': '#ff6b6b',
        'S-': '#ff8a8a',
        'A+': '#4ecdc4',
        'A': '#45b7d1',
        'A-': '#6ec8d9',
        'B+': '#f9ca24',
        'B': '#f6b93b',
        'B-': '#f8a5c2',
        'C+': '#a29bfe',
        'C': '#6c5ce7',
        'C-': '#fd79a8',
        'D+': '#dfe6e9',
        'D': '#b2bec3',
        'D-': '#636e72'
    };
    
    function getTierIndex(tier) {
        return TIERS.indexOf(tier);
    }
    
    function isValidTier(tier) {
        return TIERS.includes(tier);
    }
    
    function isHigherTier(tierA, tierB) {
        return getTierIndex(tierA) < getTierIndex(tierB);
    }
    
    // ============================================================
    // GAMEMODES
    // ============================================================
    const GAMEMODES = [
        { id: 'bedwars', label: 'BedWars', icon: '🏆' },
        { id: 'fireball', label: 'Fireball Fight', icon: '🔥' },
        { id: 'sumo', label: 'Sumo', icon: '🤼' },
        { id: 'nodebuff', label: 'Nodebuff', icon: '⚔️' },
        { id: 'boxing', label: 'Boxing', icon: '🥊' },
        { id: 'buhc', label: 'BUHC', icon: '🎯' },
        { id: 'bridges', label: 'Bridges', icon: '🌉' }
    ];
    
    function getGamemodeLabel(id) {
        const gm = GAMEMODES.find(g => g.id === id);
        return gm ? gm.label : id;
    }
    
    function getGamemodeIcon(id) {
        const gm = GAMEMODES.find(g => g.id === id);
        return gm ? gm.icon : '🎮';
    }
    
    // ============================================================
    // ROLES
    // ============================================================
    const ROLES = [
        'Guest',
        'Member',
        'Tester',
        'Senior Tester',
        'Testing Manager',
        'Owner',
        'Founder'
    ];
    
    const ROLE_SLUGS = {
        'Guest': 'guest',
        'Member': 'member',
        'Tester': 'tester',
        'Senior Tester': 'senior-tester',
        'Testing Manager': 'testing-manager',
        'Owner': 'owner',
        'Founder': 'founder'
    };
    
    const ROLE_BADGE_COLORS = {
        'Guest': '#64748b',
        'Member': '#94a3b8',
        'Tester': '#f472b6',
        'Senior Tester': '#ec4899',
        'Testing Manager': '#06b6d4',
        'Owner': '#e63946',
        'Founder': '#ffd700'
    };
    
    function getRoleIndex(role) {
        return ROLES.indexOf(role);
    }
    
    function hasAtLeast(role, minRole) {
        if (!minRole) return true;
        if (role === 'Founder') return true;
        return getRoleIndex(role) >= getRoleIndex(minRole);
    }
    
    function roleSlug(role) {
        return ROLE_SLUGS[role] || role.toLowerCase().replace(/\s+/g, '-');
    }
    
    function getRoleBadgeColor(role) {
        return ROLE_BADGE_COLORS[role] || '#94a3b8';
    }
    
    // ============================================================
    // STAFF RANKS
    // ============================================================
    const STAFF_RANKS = [
        'Trial Moderator',
        'Moderator',
        'Senior Moderator',
        'Admin',
        'Manager',
        'Owner',
        'Founder'
    ];
    
    const STAFF_RANK_ORDER = {
        'Trial Moderator': 0,
        'Moderator': 1,
        'Senior Moderator': 2,
        'Admin': 3,
        'Manager': 4,
        'Owner': 5,
        'Founder': 6
    };
    
    function getStaffRankIndex(rank) {
        return STAFF_RANK_ORDER[rank] ?? -1;
    }
    
    function isHigherStaffRank(rankA, rankB) {
        return getStaffRankIndex(rankA) > getStaffRankIndex(rankB);
    }
    
    // ============================================================
    // TESTER RANKS
    // ============================================================
    const TESTER_RANKS = [
        'Tester',
        'Senior Tester',
        'Testing Manager'
    ];
    
    // ============================================================
    // DEFAULT DATA STRUCTURES
    // ============================================================
    function getDefaultStore(key) {
        const defaults = {
            staff: [],
            testers: [],
            announcements: [],
            reviews: [],
            leaderboards: {},
            tier_log: [],
            tickets: [],
            applications: [],
            rules: 'Default rules go here.',
            tier_config: {
                lastUpdated: new Date().toISOString(),
                tiers: TIERS
            }
        };
        return defaults[key] || null;
    }
    
    // ============================================================
    // SKIN HELPER
    // ============================================================
    function getSkinUrl(username, size) {
        size = size || 100;
        return `https://crafatar.com/avatars/${encodeURIComponent(username)}?size=${size}`;
    }
    
    function getSkinFallback() {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666' font-size='40'%3E?%3C/text%3E%3C/svg%3E";
    }
    
    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        // Tiers
        TIERS: TIERS,
        TIER_CSS_VAR: TIER_CSS_VAR,
        TIER_COLORS: TIER_COLORS,
        getTierIndex: getTierIndex,
        isValidTier: isValidTier,
        isHigherTier: isHigherTier,
        
        // Gamemodes
        GAMEMODES: GAMEMODES,
        getGamemodeLabel: getGamemodeLabel,
        getGamemodeIcon: getGamemodeIcon,
        
        // Roles
        ROLES: ROLES,
        ROLE_SLUGS: ROLE_SLUGS,
        ROLE_BADGE_COLORS: ROLE_BADGE_COLORS,
        getRoleIndex: getRoleIndex,
        hasAtLeast: hasAtLeast,
        roleSlug: roleSlug,
        getRoleBadgeColor: getRoleBadgeColor,
        
        // Staff
        STAFF_RANKS: STAFF_RANKS,
        getStaffRankIndex: getStaffRankIndex,
        isHigherStaffRank: isHigherStaffRank,
        
        // Testers
        TESTER_RANKS: TESTER_RANKS,
        
        // Defaults
        getDefaultStore: getDefaultStore,
        
        // Skins
        getSkinUrl: getSkinUrl,
        getSkinFallback: getSkinFallback
    };
})();

// ============================================================
// EXPOSE TO GLOBAL
// ============================================================
window.ATL_DATA = window.ATL_DATA;
