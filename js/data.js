/* ============================================================
   ASIAN TIER LIST — REFERENCE DATA
   Single source of truth for tiers / gamemodes / roles.
   No player, review, announcement, or leaderboard data is
   pre-filled anywhere — those are populated later via the
   Owner Panel / Tester Panel once connected to a backend.
   ============================================================ */
window.ATL_DATA = {
  // Official tier system — highest to lowest. Never extend this list.
  TIERS: [
    { id:'S',  label:'S',  desc:'Region best. Elite, unquestioned.' },
    { id:'S-', label:'S-', desc:'A step below region best.' },
    { id:'A+', label:'A+', desc:'Top-tier competitor.' },
    { id:'A',  label:'A',  desc:'Consistently strong.' },
    { id:'A-', label:'A-', desc:'Strong with minor gaps.' },
    { id:'B+', label:'B+', desc:'Solid, above average.' },
    { id:'B',  label:'B',  desc:'Average competitive standard.' },
    { id:'B-', label:'B-', desc:'Slightly below average.' },
    { id:'C+', label:'C+', desc:'Developing fundamentals.' },
    { id:'C',  label:'C',  desc:'Casual competitive level.' },
    { id:'C-', label:'C-', desc:'Early competitive level.' },
    { id:'D+', label:'D+', desc:'Beginner, improving.' },
    { id:'D',  label:'D',  desc:'Beginner.' },
    { id:'D-', label:'D-', desc:'Untested fundamentals.' },
  ],

  TIER_CSS_VAR: {
    'S':'--tier-S','S-':'--tier-S2','A+':'--tier-Aplus','A':'--tier-A','A-':'--tier-Aminus',
    'B+':'--tier-Bplus','B':'--tier-B','B-':'--tier-Bminus',
    'C+':'--tier-Cplus','C':'--tier-C','C-':'--tier-Cminus',
    'D+':'--tier-Dplus','D':'--tier-D','D-':'--tier-Dminus'
  },

  GAMEMODES: [
    { id:'bedwars',       label:'BedWars',        icon:'bed' },
    { id:'fireballfight', label:'Fireball Fight', icon:'fireball' },
    { id:'sumo',          label:'Sumo',           icon:'sumo' },
    { id:'nodebuff',      label:'Nodebuff',       icon:'sword' },
    { id:'boxing',        label:'Boxing',         icon:'glove' },
    { id:'buhc',          label:'BUHC',           icon:'heart' },
    { id:'bridges',       label:'Bridges',        icon:'bridge' },
  ],

  STAFF_ROLES: [
    'Founder','Owner','Manager','Administrator','Senior Moderator','Moderator','Trial Moderator'
  ],

  TESTER_RANKS: [
    'Testing Manager','Senior Tester','Tester'
  ],

  // Discord role hierarchy used for frontend visibility gating.
  // Higher index = higher permission level.
  DISCORD_ROLE_HIERARCHY: [
    'Guest','Member','Tester','Testing Manager','Senior Tester','Owner','Founder'
  ],

  roleLevel(role){
    return this.DISCORD_ROLE_HIERARCHY.indexOf(role);
  },
  hasAtLeast(role, required){
    return this.roleLevel(role) >= this.roleLevel(required);
  },
  roleSlug(role){
    return role.toLowerCase().replace(/\s+/g,'-');
  }
};
