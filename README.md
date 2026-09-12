# CarbonLedger: Privacy-Preserving Circular Carbon Ecosystem

A decentralized, privacy-preserving ledger for tracking verified carbon reduction events and issuing carbon credits using zero-knowledge proofs (Groth16/zk-SNARKs).

## 🌿 Problem Statement

Carbon credit markets suffer from:
- **Double-counting**
- Lack of transparency and weak verification
- Fraudulent or duplicate credits
- Poor traceability between carbon reduction/capture events and issued credits
- Difficulty auditing the lifecycle of a credit

Publishing verification information on a public blockchain can expose trade secrets and market manipulation. **CarbonLedger solves this with cryptographic privacy and an auditable ledger:** carbon credit issuers can prove they meet verification thresholds without revealing raw underlying data, and the ledger tracks the exact lifecycle of the credit to prevent double issuance.

## 🔐 Solution: Zero-Knowledge Carbon Verification

CarbonLedger uses **Groth16 zk-SNARKs** to enable projects to prove their carbon reduction/capture events meet a required threshold:

```
actualCO2eReduced >= threshold
```

...without disclosing `actualCO2eReduced` to the verifier, preserving the privacy of the underlying sensitive measurement data.

### Carbon Credit Lifecycle

The system enforces a strict lifecycle for every carbon credit:
1. **Carbon Reduction/Capture Event**: A raw event is logged.
2. **Data Capture / Verification**: The event is verified using a Zero-Knowledge Proof.
3. **Credit Issuance**: Verified events generate Carbon Credits (1 credit = 1 tCO2e). **The ledger enforces that a single verified event can only issue credits ONCE (preventing double-issuance).**
4. **Credit Ownership / Transfer**: Credits are tracked and can be transferred.
5. **Credit Retirement**: Credits are retired to offset emissions. Retired credits cannot be transferred or reused.
6. **Auditable Record**: The complete lineage is preserved.

## 🚀 Quick Start (Demo)

This POC includes a script to demonstrate the full circular carbon ecosystem lifecycle, including anti-fraud measures like double-issuance prevention.

```bash
# Ensure dependencies are installed
npm install

# Run the lifecycle demo
npm run demo
```

**Demo Flow:**
- **Test 1 — Valid issuance:** Create carbon event → verify via ZKP → issue carbon credits → success.
- **Test 2 — Duplicate issuance prevention:** Attempt to issue credits for the same carbon event again → rejected by the ledger.
- **Test 3 — Transfer:** Issued credit → transfer to buyer → ownership changes.
- **Test 4 — Retirement:** Credit → retire → status becomes RETIRED.
- **Test 5 — Retired credit cannot be reused:** Attempt to transfer/retire a retired credit → rejected.
- **Test 6 — Verification failure:** Attempt to issue credits for an unverified event → rejected.

## 📊 Performance Metrics

| Metric | Value | Interpretation |
|--------|-------|-----------------|
| **Proof Size** | 256 bytes | Fixed-size Groth16 proof (π_a, π_b, π_c) |
| **Verifier Deployment** | 2,850,000 gas | One-time on-chain setup |
| **Per-Verification** | 289,096 gas | Cost per proof validation |
| **Verification Time** | ~100 ms | Off-chain verification (JavaScript) |
| **Proof Generation** | ~1-2 seconds | Prover-side computation |

To view gas metrics directly from the script:
```bash
npm run metrics
```

## 🏗️ Technical Architecture

### Circuit Design: `credit_proof.circom`

```circom
template ThresholdVerification(n) {
    signal input actualAmount;    // Private: project's actual CO2e reduced
    signal input threshold;       // Public: minimum requirement for issuance
    signal output isValid;        // Output: 1 if actualAmount >= threshold
}
```

### Smart Contract: `Verifier.sol`

Auto-generated Solidity contract that verifies Groth16 proofs on-chain, ensuring that the carbon event met the threshold requirements before credits can be issued.

## 📁 Project Structure

```
h2ledger-poc/
├── circuits/
│   ├── credit_proof.circom          # Main ZK circuit source (Circom 2.0)
│   ├── credit_proof.r1cs            # Compiled R1CS constraints
│   └── credit_proof.sym             # Circom symbol table (debugging)
│
├── contracts/
│   └── Verifier.sol                 # Auto-generated Solidity verifier
│
├── keys/
│   └── verification_key.json        # Public verification key
│
├── proofs/
│   ├── proof_pass.json              # Example valid proof
│   ├── public_pass.json             # Public signals for proof
│   └── gas_metrics.json             # Performance benchmarks
│
├── scripts/
│   ├── demo.js                      # 🔥 Demo: Complete carbon credit lifecycle
│   └── verify_metrics.js            # Gas cost calculator
│
├── README.md                        # This file
├── package.json                     # NPM dependencies
└── .gitignore                       # Standard Git exclusions
```

## 🤝 Preventing Double Counting

The POC's demo script (`demo.js`) prevents double counting through an immutable ledger invariant. 
When credits are issued for a verified carbon event (e.g., `CE-001`), the `eventId` is recorded in the `issuedEvents` set. Any subsequent attempt to issue credits against the same underlying event is immediately rejected:
```javascript
if (ledger.issuedEvents.has(eventId)) {
    // ❌ Reject: Event has already been credited!
}
```
Similarly, a credit's `status` acts as a state machine (`ACTIVE` -> `RETIRED`). Once transitioned to `RETIRED`, all future transfer or retirement attempts are blocked.

---

**Status:** Hackathon Proof of Concept (v0.1.0)
