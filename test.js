const STAGES = ['Stage 1', 'Stage 2', 'Stage 4', 'Stage 5', 'Stage 6', 'Stage 7', 'Stage 8', 'Final Stage'];

const COORDS = {
  // Stage 1
  'GroupA_Cone': { cx: 51, cy: 138, text: 'Left Tower (Bottom-Left)' },
  'GroupB_Healer': { cx: 31, cy: 179, text: 'Left Tower (Bottom)' },
  'GroupA_Support_Stack': { cx: 78, cy: 79, text: 'Left Tower (Top)' },
  'GroupB_Tank': { cx: 116, cy: 10, text: 'North-West' },
  'GroupB_DPS': { cx: 251, cy: 15, text: 'North-East' },
  'GroupA_DPS_Stack': { cx: 271, cy: 44, text: 'North-East (Inner)' },
  'GroupA_Aoe': { cx: 301, cy: 143, text: 'Right Tower (Bottom-Right)' },

  // Stage 2/4/6/8/Final
  'Stage2_GroupA_Support_Cone': { cx: 113, cy: 136, text: 'Left Tower (Inner-Right)' },
  'Stage2_GroupB_Tank': { cx: 147, cy: 10, text: 'North-West' },
  'Stage2_GroupB_Melee': { cx: 257, cy: 10, text: 'North-East' },
  'Stage2_GroupA_DPS_Cone': { cx: 295, cy: 136, text: 'Right Tower (Inner-Left)' },
  'Stage2_GroupA_DPS_Aoe': { cx: 331, cy: 251, text: 'South-East' },
  'Stage2_GroupB_RangedDPS': { cx: 405, cy: 154, text: 'Far East' },
  'Stage2_GroupB_Healer': { cx: 10, cy: 164, text: 'Far West' },
  'Stage2_GroupA_Support_AOE': { cx: 75, cy: 251, text: 'South-West' },
};

const supportRoles = ['MT', 'OT', 'H1', 'H2'];
const dpsRoles = ['Melee1', 'Melee2', 'Ranged1', 'Ranged2'];
const tankRoles = ['MT', 'OT'];
const healerRoles = ['H1', 'H2'];
const partners = { 'MT': 'OT', 'OT': 'MT', 'H1': 'H2', 'H2': 'H1', 'Melee1': 'Melee2', 'Melee2': 'Melee1', 'Ranged1': 'Ranged2', 'Ranged2': 'Ranged1' };

function isMelee(role) { return role === 'Melee1' || role === 'Melee2'; }
function isRangedDps(role) { return role === 'Ranged1' || role === 'Ranged2'; }

function groupAButtonName(bucket, debuff) {
  if (bucket === 'support') {
    return debuff === 'cone' ? 'GroupA_Support_Cone' : 'GroupA_Support_AOE';
  }
  return debuff === 'cone' ? 'GroupA_DPS_Cone' : 'GroupA_DPS_Aoe';
}

function fixedGroupBButtonFor(role) {
  if (tankRoles.includes(role)) return 'GroupB_Tank';
  if (healerRoles.includes(role)) return 'GroupB_Healer';
  if (isMelee(role)) return 'GroupB_Melee';
  if (isRangedDps(role)) return 'GroupB_RangedDPS';
  return null;
}

function groupAPlacementButtonFor(role, debuff, otherRole, sameAsPartner) {
  if (sameAsPartner && dpsRoles.includes(role) && dpsRoles.includes(otherRole)) {
    return isRangedDps(role) ? groupAButtonName('dps', debuff) : groupAButtonName('support', debuff);
  }
  if (sameAsPartner && supportRoles.includes(role) && supportRoles.includes(otherRole)) {
    return healerRoles.includes(role) ? groupAButtonName('support', debuff) : groupAButtonName('dps', debuff);
  }
  if (supportRoles.includes(role)) {
    return groupAButtonName('support', debuff);
  }
  return groupAButtonName('dps', debuff);
}

function calc(role, group, stageName, debuff, sameAsPartner) {
  let id = null;
  const partnerRole = partners[role];

  if (stageName === 'Stage 1') {
    if (group === 'GroupA') {
      if (debuff === 'cone') id = 'GroupA_Cone';
      if (debuff === 'aoe') id = 'GroupA_Aoe';
      if (debuff === 'stack') {
        id = supportRoles.includes(role) ? 'GroupA_Support_Stack' : 'GroupA_DPS_Stack';
      }
    } else {
      if (tankRoles.includes(role)) id = 'GroupB_Tank';
      if (healerRoles.includes(role)) id = 'GroupB_Healer';
      if (dpsRoles.includes(role)) id = 'GroupB_DPS';
    }
    return id;
  }

  if (stageName === 'Stage 2' || stageName === 'Stage 4') {
    if (group === 'GroupA') id = groupAPlacementButtonFor(role, debuff, partnerRole, sameAsPartner);
    else id = fixedGroupBButtonFor(role);
    return id ? 'Stage2_' + id : null;
  }
}

const testCases = [
  { role: 'MT', debuff: 'stack', same: false },
  { role: 'MT', debuff: 'cone', same: false },
  { role: 'Melee1', debuff: 'stack', same: false },
  { role: 'Melee1', debuff: 'aoe', same: true }
];

testCases.forEach(tc => {
  ['Stage 1', 'Stage 2', 'Stage 4'].forEach(stage => {
    const id = calc(tc.role, 'GroupA', stage, tc.debuff, tc.same);
    console.log(`Group A | ${tc.role} | ${tc.debuff} | Same:${tc.same} | ${stage} => ${id} (${COORDS[id] ? COORDS[id].text : '???'})`);
  });
});
