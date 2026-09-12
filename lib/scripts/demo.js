const { execSync } = require('child_process');
const fs = require('fs');

console.log('==================================================');
console.log('🌿 CIRCULAR CARBON ECOSYSTEM: CARBONLEDGER POC 🌿');
console.log('==================================================\n');

// The Ledger State
const ledger = {
  events: new Map(),       // Stores raw carbon reduction events
  credits: new Map(),      // Stores issued credits
  issuedEvents: new Set()  // Tracks event IDs that have already generated credits (Double-issuance prevention)
};

// 1. Carbon Event Creation
function createCarbonEvent(eventId, projectId, issuerId, co2eReduced) {
  console.log(`[Event Creation] Registering Carbon Event: ${eventId}`);
  const event = {
    eventId,
    projectId,
    issuerId,
    co2eReduced,
    timestamp: new Date().toISOString(),
    status: 'UNVERIFIED'
  };
  ledger.events.set(eventId, event);
  console.log(`   -> Event ${eventId} created for ${co2eReduced} tCO2e (Status: UNVERIFIED)\n`);
  return event;
}

// 2. Verification (Using existing ZK proofs)
function verifyCarbonEvent(eventId) {
  console.log(`[Verification] Verifying Event: ${eventId}`);
  const event = ledger.events.get(eventId);
  if (!event) throw new Error('Event not found');

  try {
    // We simulate verification using the existing ZKP architecture.
    // The ZK proof verifies that actualAmount >= threshold without revealing the actual amount.
    console.log('   -> Executing Zero-Knowledge Proof (Groth16)...');
    execSync('npm run verify', { stdio: 'pipe' });
    console.log('   -> ✅ ZK Proof Validated On-Chain (Simulated).');
    event.status = 'VERIFIED';
    console.log(`   -> Event ${eventId} is now VERIFIED.\n`);
    return true;
  } catch (error) {
    console.log('   -> ❌ Verification Failed.\n');
    return false;
  }
}

// 3 & 4. Credit Issuance & Prevent Double Issuance
function issueCredits(eventId) {
  console.log(`[Issuance] Attempting to issue credits for Event: ${eventId}`);
  const event = ledger.events.get(eventId);
  
  if (!event || event.status !== 'VERIFIED') {
    console.log(`   -> ❌ Reject: Event ${eventId} is not verified.\n`);
    return;
  }

  // Double-counting prevention: Check if event already generated credits
  if (ledger.issuedEvents.has(eventId)) {
    console.log(`   -> ❌ Reject (Double Issuance): Event ${eventId} has already been credited!\n`);
    return;
  }

  const creditId = `CREDIT-${Date.now()}`;
  const credit = {
    creditId,
    eventId: event.eventId,
    amount: event.co2eReduced, // 1 credit = 1 tCO2e
    owner: event.issuerId,
    status: 'ACTIVE',
    history: [`Issued to ${event.issuerId}`]
  };

  ledger.credits.set(creditId, credit);
  ledger.issuedEvents.add(eventId); // Lock this event from future issuance

  console.log(`   -> ✅ Success: Issued ${credit.amount} credits (ID: ${creditId}) to ${credit.owner}.\n`);
  return creditId;
}

// 5. Credit Ownership / Transfer
function transferCredit(creditId, newOwner) {
  console.log(`[Transfer] Attempting to transfer Credit: ${creditId} to ${newOwner}`);
  const credit = ledger.credits.get(creditId);

  if (!credit) {
    console.log(`   -> ❌ Reject: Credit not found.\n`);
    return;
  }

  if (credit.status === 'RETIRED') {
    console.log(`   -> ❌ Reject: Cannot transfer RETIRED credit ${creditId}.\n`);
    return;
  }

  console.log(`   -> ✅ Success: Transferred from ${credit.owner} to ${newOwner}`);
  credit.owner = newOwner;
  credit.history.push(`Transferred to ${newOwner}`);
  console.log(`   -> Current Owner: ${credit.owner}\n`);
}

// 6. Credit Retirement
function retireCredit(creditId) {
  console.log(`[Retirement] Attempting to retire Credit: ${creditId}`);
  const credit = ledger.credits.get(creditId);

  if (!credit) {
    console.log(`   -> ❌ Reject: Credit not found.\n`);
    return;
  }

  if (credit.status === 'RETIRED') {
    console.log(`   -> ❌ Reject (Double Retirement): Credit ${creditId} is already RETIRED.\n`);
    return;
  }

  credit.status = 'RETIRED';
  credit.history.push('Retired');
  console.log(`   -> ✅ Success: Credit ${creditId} has been RETIRED and removed from circulation.\n`);
}

// --- DEMONSTRATION SCRIPT ---

async function runDemo() {
  // Test 1: Valid Issuance
  console.log('--- TEST 1: VALID ISSUANCE ---');
  createCarbonEvent('CE-001', 'PROJECT-001', 'issuer-001', 10);
  verifyCarbonEvent('CE-001');
  const creditId = issueCredits('CE-001');

  // Test 2: Duplicate Issuance Prevention
  console.log('--- TEST 2: DUPLICATE ISSUANCE PREVENTION ---');
  issueCredits('CE-001'); // Should reject

  // Test 3: Transfer
  console.log('--- TEST 3: CREDIT TRANSFER ---');
  transferCredit(creditId, 'buyer-001');

  // Test 4: Retirement
  console.log('--- TEST 4: CREDIT RETIREMENT ---');
  retireCredit(creditId);

  // Test 5: Retired Credit Cannot Be Reused (Transferred/Retired Again)
  console.log('--- TEST 5: PREVENT REUSE OF RETIRED CREDIT ---');
  transferCredit(creditId, 'buyer-002'); // Should reject
  retireCredit(creditId); // Should reject

  // Test 6: Verification Failure & Unverified Issuance
  console.log('--- TEST 6: UNVERIFIED EVENT ISSUANCE ---');
  createCarbonEvent('CE-002', 'PROJECT-002', 'issuer-002', 20);
  // Skipped verification intentionally
  issueCredits('CE-002'); // Should reject

  console.log('==================================================');
  console.log('AUDIT LOG FOR CREDIT:', creditId);
  console.log(ledger.credits.get(creditId));
  console.log('==================================================\n');
}

runDemo();
