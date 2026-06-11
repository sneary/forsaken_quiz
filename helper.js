document.addEventListener('DOMContentLoaded', () => {
  const STAGES = [
    'Stage 1', 
    'Stage 2', 
    'Stage 3', 
    'Stage 4', 
    'Stage 5', 
    'Stage 6', 
    'Stage 7', 
    'Stage 8'
  ];

  const supportRoles = ['MT', 'OT', 'H1', 'H2'];
  const dpsRoles = ['Melee1', 'Melee2', 'Ranged1', 'Ranged2'];
  const tankRoles = ['MT', 'OT'];
  const healerRoles = ['H1', 'H2'];
  const partners = { 'MT': 'OT', 'OT': 'MT', 'H1': 'H2', 'H2': 'H1', 'Melee1': 'Melee2', 'Melee2': 'Melee1', 'Ranged1': 'Ranged2', 'Ranged2': 'Ranged1' };

  function isMelee(role) { return role === 'Melee1' || role === 'Melee2'; }
  function isRangedDps(role) { return role === 'Ranged1' || role === 'Ranged2'; }

  const state = {
    role: null,
    group: null,
    stageIndex: 0,
    myDebuff: null,
    partnerDebuff: null
  };

  // Set the stack image source using the loaded stack_marker.js variable
  const stackImg = document.getElementById('stack-img');
  if (stackImg && typeof stackMarkerSrc !== 'undefined') {
    stackImg.src = stackMarkerSrc;
  }

  const resetBtn = document.getElementById('resetBtn');
  const nextStageBtn = document.getElementById('nextStageBtn');
  const stageTitle = document.getElementById('stageTitle');
  const instructionText = document.getElementById('instructionText');

  // SVG containers
  const svgMap = {
    'Stage 1': 'placementStage',
    'Stage 2': 'placementStage2',
    'Stage 3': 'placementStage',
    'Stage 4': 'placementStage2',
    'Stage 5': 'placementStage',
    'Stage 6': 'placementStage2',
    'Stage 7': 'placementStage',
    'Stage 8': 'placementStage2'
  };

  // Add click listeners to setup buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      state.role = e.currentTarget.dataset.role;
      updateDisplay();
    });
  });

  document.querySelectorAll('.group-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      state.group = e.currentTarget.dataset.group;
      updateDisplay();
    });
  });

  resetBtn.addEventListener('click', () => {
    state.stageIndex = 0;
    resetDebuffSelections();
    renderStage();
  });

  // Debuff listeners
  document.querySelectorAll('.debuff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.debuff-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      state.myDebuff = e.currentTarget.dataset.debuff;
      updateDisplay();
    });
  });

  document.querySelectorAll('.partner-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.partner-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      state.partnerDebuff = e.currentTarget.dataset.partner;
      updateDisplay();
    });
  });

  nextStageBtn.addEventListener('click', () => {
    if (state.stageIndex < STAGES.length - 1) {
      state.stageIndex++;
      renderStage();
    } else {
      instructionText.textContent = "Mechanic Complete!";
      nextStageBtn.classList.add('disabled');
    }
  });

  function resetDebuffSelections() {
    state.myDebuff = null;
    state.partnerDebuff = null;
    document.querySelectorAll('.debuff-btn, .partner-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
  }

  function hideAllStages() {
    document.querySelectorAll('.placement-stage').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.choice-circle').forEach(el => el.classList.remove('highlight'));
  }

  function renderStage() {
    const stageName = STAGES[state.stageIndex];
    stageTitle.textContent = stageName;
    hideAllStages();
    
    const svgId = svgMap[stageName];
    if (svgId) {
      document.getElementById(svgId).classList.remove('hidden');
    }
    updateDisplay();
  }

  function updateDisplay() {
    nextStageBtn.classList.add('disabled');
    document.querySelectorAll('.choice-circle').forEach(el => el.classList.remove('highlight'));
    document.querySelectorAll('.placement-stage').forEach(el => el.classList.add('hidden'));

    if (!state.role || !state.group) {
      instructionText.textContent = 'Select your Role and Group to begin.';
      instructionText.className = '';
      return;
    }

    const stageName = STAGES[state.stageIndex];
    stageTitle.textContent = stageName;
    const svgId = svgMap[stageName];
    if (svgId) {
      document.getElementById(svgId).classList.remove('hidden');
    }

    const debuffControls = document.getElementById('debuffControls');
    debuffControls.classList.remove('hidden');

    if (!state.myDebuff || !state.partnerDebuff) {
      instructionText.textContent = 'Select both debuffs to see position.';
      instructionText.className = '';
      return;
    }

    const choiceId = calculateSpotId();

    if (!choiceId) {
      instructionText.textContent = 'Invalid combination for this group.';
      instructionText.className = 'error';
    } else {
      const spotEl = document.getElementById(choiceId);
      if (spotEl) {
        instructionText.textContent = 'Go to the highlighted spot!';
        instructionText.className = '';
        spotEl.classList.add('highlight');
        nextStageBtn.classList.remove('disabled');
      } else {
        instructionText.textContent = 'Spot ID not found: ' + choiceId;
        instructionText.className = 'error';
      }
    }
  }

  // --- Logic ported from script.js ---

  function groupAButtonName(bucket, debuff) {
    if (bucket === 'support') {
      return debuff === 'cone' ? 'GroupA_Support_Cone' : 'GroupA_Support_AOE';
    }
    return debuff === 'cone' ? 'GroupA_DPS_Cone' : 'GroupA_DPS_Aoe';
  }

  function groupAPlacementButtonFor(role, debuff, otherRole, otherDebuff) {
    const sameDebuff = otherDebuff && debuff === otherDebuff;
    if (sameDebuff && dpsRoles.includes(role) && dpsRoles.includes(otherRole)) {
      return isRangedDps(role) ? groupAButtonName('dps', debuff) : groupAButtonName('support', debuff);
    }
    if (sameDebuff && supportRoles.includes(role) && supportRoles.includes(otherRole)) {
      return healerRoles.includes(role) ? groupAButtonName('support', debuff) : groupAButtonName('dps', debuff);
    }
    if (supportRoles.includes(role)) {
      return groupAButtonName('support', debuff);
    }
    return groupAButtonName('dps', debuff);
  }

  function fixedGroupBButtonFor(role) {
    if (tankRoles.includes(role)) return 'GroupB_Tank';
    if (healerRoles.includes(role)) return 'GroupB_Healer';
    if (isMelee(role)) return 'GroupB_Melee';
    if (isRangedDps(role)) return 'GroupB_RangedDPS';
    return null;
  }

  function getOddInnerId(debuff, role) {
    if (debuff === 'cone') return 'GroupA_Cone';
    if (debuff === 'aoe') return 'GroupA_Aoe';
    if (debuff === 'stack') {
      return supportRoles.includes(role) ? 'GroupA_Support_Stack' : 'GroupA_DPS_Stack';
    }
    return null;
  }

  function getOddOuterId(role) {
    if (tankRoles.includes(role)) return 'GroupB_Tank';
    if (healerRoles.includes(role)) return 'GroupB_Healer';
    if (dpsRoles.includes(role)) return 'GroupB_DPS';
    return null;
  }

  function getEvenInnerId(role, debuff, partnerRole, partnerDebuff) {
    const id = groupAPlacementButtonFor(role, debuff, partnerRole, partnerDebuff);
    return id ? 'Stage2_' + id : null;
  }

  function getEvenOuterId(role) {
    const id = fixedGroupBButtonFor(role);
    return id ? 'Stage2_' + id : null;
  }

  function calculateSpotId() {
    const role = state.role;
    const partnerRole = partners[role];
    const debuff = state.myDebuff;
    // Interpret 'Same'/'Different' to construct a valid partnerDebuff string
    const partnerDebuff = state.partnerDebuff === 'Same' ? debuff : 'DifferentDebuff';
    const stageName = STAGES[state.stageIndex];
    const group = state.group.replace(' ', ''); // "GroupA" or "GroupB"

    // Extract stage number (e.g. "Stage 5" -> 5)
    const stageNumber = parseInt(stageName.replace('Stage ', ''));
    const isOdd = stageNumber % 2 !== 0;

    // Core rule for Inner vs Outer
    // Group A is Inside for 3 (Stage 1, 2, 3), Outside for 4 (Stage 4, 5, 6, 7), Inside for 1 (Stage 8)
    const isGroupA = group === 'GroupA';
    let isInner = false;

    if ([1, 2, 3, 8].includes(stageNumber)) {
      isInner = isGroupA;
    } else {
      isInner = !isGroupA;
    }

    // Core rule for Odd vs Even Maps
    if (isOdd) {
      if (isInner) return getOddInnerId(debuff, role);
      else return getOddOuterId(role);
    } else {
      if (isInner) return getEvenInnerId(role, debuff, partnerRole, partnerDebuff);
      else return getEvenOuterId(role);
    }
  }
});
