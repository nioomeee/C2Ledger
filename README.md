# C2Ledger 🌱

### One credit. One identity. One auditable lifecycle.

C2Ledger is a blockchain-powered carbon credit verification and tracking system designed to bring transparency, traceability, and integrity to the carbon market.

It connects real-world carbon reduction or capture events to verified carbon credits and tracks every stage of their lifecycle — from data capture and verification to issuance, ownership, transfer, and final retirement.

By maintaining a verifiable ledger of every credit, C2Ledger helps prevent double-counting and double-selling while giving issuers, buyers, auditors, and regulators a transparent source of truth.

---

## 🌍 The Problem

Carbon markets face a fundamental trust problem.

Carbon credits can be:

- Double-counted
- Double-sold
- Poorly verified
- Difficult to trace
- Recorded across fragmented systems
- Difficult for buyers and auditors to independently verify

A carbon credit is only valuable if everyone can trust:

> Where did it come from?

> Was the underlying carbon reduction actually verified?

> Who owns it?

> Has it already been transferred?

> Has it already been retired?

C2Ledger is built to answer these questions through an auditable digital lifecycle.

---

## 💡 The Solution

C2Ledger creates a verifiable chain connecting the physical world to the carbon market:

```text
REAL-WORLD CARBON EVENT
          ↓
     DATA CAPTURE
          ↓
       EVIDENCE
          ↓
      VERIFICATION
          ↓
    CREDIT ISSUANCE
          ↓
      OWNERSHIP
          ↓
       TRANSFER
          ↓
      RETIREMENT
          ↓
   PERMANENT PROOF
```

Every important action generates a traceable ledger record.

---

## 🔐 Core Features

### Carbon Project Registration

Create and manage carbon reduction and carbon removal projects with information such as:

- Project type
- Location
- Issuer
- Measurement methodology
- Expected CO₂e reduction
- Verification status

### Carbon Event Tracking

Record individual carbon reduction or capture events and associate them with supporting evidence.

### Verification

Auditors can review submitted carbon events and verify or reject them before credits can be issued.

### Verifiable Credit Issuance

Credits can only be issued against verified carbon reductions.

The system prevents issuance beyond the verified CO₂e quantity.

### Credit Registry

Every credit receives a unique identity and lifecycle status.

Example:

```text
H2C-000417
```

### Provenance

Users can inspect the complete history of a credit:

```text
Carbon Event
     ↓
Verification
     ↓
Issuance
     ↓
Ownership
     ↓
Transfer
     ↓
Retirement
```

### Ownership Transfers

Credit ownership is recorded whenever credits move between organizations.

### Retirement

Corporate buyers can permanently retire credits against their emissions.

Once retired, credits cannot be transferred or sold again.

### Double-Count Prevention

C2Ledger prevents the same carbon event from being used to issue credits multiple times.

### Double-Sell Prevention

Credits cannot be transferred beyond the owner's available balance or transferred after retirement.

### Public Verification

Credits and their provenance can be independently inspected through their unique identifiers and ledger references.

---

## 🧠 Why Blockchain?

C2Ledger uses distributed-ledger technology where immutability and shared verification provide meaningful value.

The goal isn't to put "blockchain" on a carbon marketplace for the sake of it.

Instead, the ledger acts as a shared source of truth for:

- Verification
- Issuance
- Ownership
- Transfers
- Retirement
- Audit history

This creates a tamper-resistant lifecycle for every credit.

---

## 👥 Users

### Carbon Credit Issuers

Register projects, submit carbon events, provide evidence, and issue verified credits.

### Corporate Buyers

Discover verified credits, acquire them, inspect their provenance, and retire them.

### Auditors / Verifiers

Review carbon events, inspect evidence, and verify carbon reductions before issuance.

### Regulatory Bodies

Inspect projects, credits, ownership history, transfers, retirements, and suspicious activity.

---

## 🏗️ Architecture

```text
                 ┌─────────────────────┐
                 │     C2Ledger UI     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Application API  │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
     ┌─────────────────┐        ┌─────────────────┐
     │ Carbon / Project│        │ Ledger / Smart  │
     │     Data        │        │    Contracts    │
     └─────────────────┘        └────────┬────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ Immutable Lifecycle │
                              │       Records       │
                              └─────────────────────┘
```

The exact implementation may evolve as the project develops.

---

## 🔄 Credit Lifecycle

A credit follows a defined lifecycle:

```text
CREATED
   ↓
VERIFIED
   ↓
ISSUED
   ↓
AVAILABLE
   ↓
TRANSFERRED
   ↓
RETIRED
```

Critical invariants are enforced throughout the lifecycle.

For example:

```text
Verified CO₂e = 1,000 tonnes

Maximum credits = 1,000

Attempt to issue another 500
             ↓
          BLOCKED
```

Similarly:

```text
100 credits
     ↓
  RETIRED
     ↓
Attempt to transfer
     ↓
   BLOCKED
```

---

## 🛡️ Integrity Rules

C2Ledger is designed to prevent:

- Issuing more credits than verified CO₂e
- Duplicate credit issuance
- Duplicate carbon events
- Evidence reuse
- Transfers beyond available balance
- Transfers of retired credits
- Duplicate retirement
- Negative credit quantities

These checks form the integrity layer of the platform.

---

## 🌱 Example

Imagine a renewable energy project in Gujarat generates enough clean electricity to avoid:

```text
1,000 tCO₂e
```

After verification:

```text
1,000 carbon credits
```

are issued.

A corporate buyer acquires:

```text
100 credits
```

The buyer later retires those credits.

The ledger now records:

```text
Project
  ↓
Carbon Event
  ↓
Verification
  ↓
1,000 Credits Issued
  ↓
100 Credits Transferred
  ↓
100 Credits Retired
```

Attempting to sell those 100 retired credits again results in:

```text
TRANSACTION BLOCKED

Retired credits cannot be transferred or sold.
```

---

## 🧪 Hackathon POC

C2Ledger is currently developed as a Proof of Concept for the:

### Circular Carbon Ecosystem

**Challenge:** Verifiable Carbon Credit & Offset Tracking System

The POC focuses on demonstrating the complete lifecycle of a carbon credit and the prevention of double-counting and double-selling.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the required runtime and package manager installed for the project.

Clone the repository:

```bash
git clone https://github.com/nioomeee/C2Ledger.git
cd C2Ledger
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

> The exact commands may change as the project architecture evolves.

---

## 🧑‍💻 Development

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and commit:

```bash
git add .
git commit -m "feat: add carbon event verification"
```

Push your branch:

```bash
git push origin feature/your-feature
```

---

## 🗺️ Roadmap

### P0 — Core

- [x] Carbon project model
- [x] Carbon event tracking
- [x] Verification workflow
- [x] Credit issuance
- [x] Credit registry
- [x] Ownership tracking
- [x] Credit transfers
- [x] Credit retirement
- [x] Provenance
- [x] Audit trail
- [x] Double-count prevention
- [x] Double-sell prevention

### P1 — Enhanced Trust

- [ ] Public credit verification
- [ ] Evidence hashing
- [ ] Regulatory dashboard
- [ ] Fraud/integrity dashboard
- [ ] Digital identity
- [ ] Advanced analytics

### P2 — Ecosystem Expansion

- [ ] IoT data integration
- [ ] IPFS evidence storage
- [ ] QR-based credit verification
- [ ] EVM testnet deployment
- [ ] Advanced carbon methodologies
- [ ] Interoperability with external registries

---

## 🤝 Contributing

Contributions are welcome.

If you would like to improve C2Ledger:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your implementation.
5. Open a pull request.

For significant changes, please open an issue first to discuss the proposed approach.

---

## ⚠️ Disclaimer

C2Ledger is a Proof of Concept and is not intended to serve as a certified carbon registry, financial instrument, or substitute for recognized carbon-market standards or regulatory systems.

Carbon accounting methodologies, verification standards, and regulatory requirements should be implemented in accordance with the relevant jurisdiction and applicable standards before production deployment.

---

## 📄 License

C2Ledger is released under the MIT License.

See [LICENSE](LICENSE) for details.

---

## 🌱 Vision

Carbon markets need more than credits.

They need trust.

C2Ledger aims to create the infrastructure where every credit can answer three simple questions:

**Where did it come from?**

**Who verified it?**

**What happened to it?**

### One credit.

### One identity.

### One auditable lifecycle.
