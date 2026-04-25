# CredOS — Full Technical Architecture

> **4-layer system:** Developer Clients → API Gateway → Domain Engines → Data Stores.
> External systems (AWS, KMS, Slack, Provider APIs) connect at the engine layer.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow 1 — Pre-Commit Secret Detection](#data-flow-1--pre-commit-secret-detection)
3. [Data Flow 2 — JIT Access via Slack](#data-flow-2--jit-access-via-slack)
4. [Data Flow 3 — Vault Envelope Encryption](#data-flow-3--vault-envelope-encryption)
5. [Data Flow 4 — Employee Offboarding](#data-flow-4--employee-offboarding)
6. [Identity Graph — Core Schema](#identity-graph--core-schema)
7. [Technology Decisions](#technology-decisions)
8. [Security of CredOS Itself](#security-of-credos-itself)

---

## System Overview

```
┌─────────────────────────────── LAYER 1: CLIENTS ────────────────────────────────┐
│                                                                                   │
│   CLI Hook          IDE Plugin         Slack Bot          Dashboard              │
│   Rust·offline      VS Code /          JIT requests       Next.js·              │
│   first             JetBrains          + alerts           WebSocket             │
│                                                                                   │
└───────────────────────────────────────┬───────────────────────────────────────────┘
                                         │
┌───────────────────────────── LAYER 2: EDGE ────────────────────────────────────┐
│                                        │                                         │
│              API Gateway + Auth Middleware                                       │
│     OAuth2 · OIDC · JWT · Rate Limiting · Request Signing                       │
│                     Immutable Audit Trail                                        │
│                                                                                  │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
┌──────────────────────────── LAYER 3: ENGINES ──────────────────────────────────┐
│                                                                                   │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│   │    Vault      │   │  IAM Engine  │   │  JIT Engine  │   │ Offboarding  │   │
│   │ AES-256       │   │   Policy     │   │    Access    │   │ Auto-revoke  │   │
│   │ envelope      │   │   analyzer   │   │    grants    │   │              │   │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│          │                   │                   │                   │           │
│   External Calls:   Cloud IAM (AWS/GCP/Azure) · KMS · Key Vendors · Slack API  │
│                     Customer IdP (Okta, Azure AD) · AWS STS                     │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
┌──────────────────────────── LAYER 4: STORAGE ──────────────────────────────────┐
│                                                                                   │
│   PostgreSQL                  Redis                    Secret Store              │
│   Identity graph              Sessions + queue         Encrypted blobs (S3)      │
│   + events                                                                        │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

```mermaid
graph TD
    subgraph CLIENTS["Layer 1 — Clients"]
        CLI["🖥️ CLI Hook\nRust · offline-first"]
        IDE["🔌 IDE Plugin\nVS Code / JetBrains"]
        SLACK["💬 Slack Bot\nJIT requests + alerts"]
        DASH["📊 Dashboard\nNext.js · WebSocket"]
    end

    subgraph EDGE["Layer 2 — Edge"]
        GW["API Gateway + Auth Middleware\nOAuth2 · OIDC · JWT · Rate Limiting\nRequest Signing · Immutable Audit Trail"]
    end

    subgraph ENGINES["Layer 3 — Engines"]
        VAULT["🔐 Vault\nAES-256 envelope"]
        IAM["🛡️ IAM Engine\nPolicy analyzer"]
        JIT["⚡ JIT Engine\nAccess grants"]
        OFF["🚪 Offboarding\nAuto-revoke"]
    end

    subgraph STORAGE["Layer 4 — Storage"]
        PG["🗄️ PostgreSQL\nIdentity graph + events"]
        REDIS["⚡ Redis\nSessions + queue"]
        S3["🪣 Secret Store\nEncrypted blobs (S3)"]
    end

    subgraph EXTERNAL["External Systems"]
        CLOUD["☁️ Cloud IAM\nAWS · GCP · Azure"]
        KMS["🔑 KMS\nAWS KMS · GCP KMS"]
        VENDORS["🔧 Key Vendors\nStripe · OpenAI · GitHub · Twilio"]
        IDP["👤 Customer IdP\nOkta · Azure AD · Google"]
        SLACKAPI["💬 Slack API"]
        STS["🎟️ AWS STS\nJIT temp credentials"]
    end

    CLI --> GW
    IDE --> GW
    SLACK --> GW
    DASH --> GW

    GW --> VAULT
    GW --> IAM
    GW --> JIT
    GW --> OFF

    VAULT --> PG
    VAULT --> S3
    IAM --> PG
    JIT --> REDIS
    OFF --> PG

    IAM --> CLOUD
    VAULT --> KMS
    IAM --> VENDORS
    GW --> IDP
    SLACK --> SLACKAPI
    JIT --> STS
```

---

## Data Flow 1 — Pre-Commit Secret Detection

> **Privacy guarantee:** The CLI runs fully offline. No staged file content leaves the developer's machine. The API call for blast radius scoring sends only metadata (secret type + hash prefix) — never the raw secret value. The vault storage offer is always opt-in.

```mermaid
flowchart TD
    A["🔀 git commit fires hook\n.git/hooks/pre-commit → executes credos-guard binary"]
    B["🔍 Local pattern scan\n400+ patterns · Shannon entropy analysis · no network call"]
    C{"Secret\ndetected?"}
    D["✅ No secret\nCommit proceeds normally"]
    E["🚫 Commit blocked\nTerminal shows: secret type · blast radius ($)\nfix offer · line number"]
    F{"--no-verify\nbypass?"}
    G["⚠️ Bypass logged + alert sent"]
    H["🏦 Vault storage + file rewrite\nPOST /vault/store → returns credos://org/key\nfile rewritten with reference"]
    I["✅ Commit succeeds — clean\nSecret never in git history\nBlast radius delta: eliminated"]

    A --> B
    B --> C
    C -->|No| D
    C -->|Yes| E
    E --> F
    F -->|Yes| G
    F -->|No - opt in to vault| H
    H --> I
```

---

## Data Flow 2 — JIT Access via Slack

> **Speed guarantee:** The entire loop — from Slack command to temporary credential delivery — completes in **under 60 seconds**. All session tokens are tracked in Redis with a TTL. Revocation is automatic: no human action required, no forgotten access.

```mermaid
sequenceDiagram
    participant U as 👤 User (Slack)
    participant JIT as ⚡ JIT Engine
    participant CH as #approvals Channel
    participant APR as ✅ Approver
    participant STS as 🎟️ AWS STS
    participant R as ⚡ Redis

    U->>JIT: /access prod-db 60min reason: debugging ticket #1234
    JIT->>JIT: Validate request\n(resource exists? · requester eligible?\npolicy allows? · duration ok?)

    alt Validation fails
        JIT-->>U: ❌ DM sent + logged
    else Validation passes
        JIT->>CH: Post approval request\n(requester · resource · reason · duration)
        APR->>JIT: Clicks ✅ Approve\n(Slack interaction payload)
        JIT->>STS: AssumeRole\n(ephemeral credentials · 60min TTL\nscoped to minimum permissions)
        STS-->>JIT: Temporary credentials
        JIT->>R: SET session key · EXPIREAT +60min
        JIT-->>U: 📬 Slack DM with credentials\n+ auto-revoke at expiry + full audit log
    end
```

---

## Data Flow 3 — Vault Envelope Encryption

> **Zero-knowledge guarantee:** The plaintext secret never exists in CredOS infrastructure — it is encrypted client-side before transit. CredOS cannot read your secrets because the Key Encryption Key (KEK) lives in your own KMS account, not CredOS servers.

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant V as 🔐 Vault Service
    participant KMS as 🔑 Customer KMS\n(AWS / GCP)
    participant DB as 🗄️ PostgreSQL

    C->>V: 01 · Secret sent over mTLS\n(never logged, never stored in plaintext)
    V->>V: 02 · Generate 256-bit DEK\n(random, per-secret, in memory)
    V->>V: 03 · AES-256-GCM encrypt\nDEK + random nonce → encrypted_secret blob
    V->>KMS: 04 · KMS.Encrypt(DEK)\n(in customer's own account)
    KMS-->>V: encrypted_DEK returned
    V->>DB: 05 · Store encrypted_secret + encrypted_DEK\n(DEK destroyed from memory)
    V-->>C: 06 · Return reference\ncredos://org/service/key-name

    Note over V: DEK never persists beyond a single request

    rect rgb(230, 245, 230)
        Note over C,DB: RETRIEVAL PATH
        C->>DB: Fetch encrypted_DEK
        DB-->>V: encrypted_DEK
        V->>KMS: KMS.Decrypt(encrypted_DEK)
        KMS-->>V: DEK recovered
        V->>V: AES-GCM decrypt blob → plaintext
        V-->>C: Plaintext delivered over mTLS\n(DEK immediately destroyed)
    end
```

---

## Data Flow 4 — Employee Offboarding

```mermaid
flowchart LR
    T1["01\n🔔 Trigger\nOkta SCIM webhook\nfires on user.deactivated\n(or HR system / manual)"]
    T2["02\n🕸️ Graph Traversal\nQuery identity graph:\nSELECT all credentials\nWHERE owner_id = departing_user"]
    T3["03\n📋 Revocation Plan\nOrdered list: highest blast-radius\ncredentials first.\nManager sees plan before execution"]
    T4["04\n⚡ Execute\nParallel API calls:\nAWS DeleteAccessKey\nGitHub deleteToken\nStripe revokeKey\nOpenAI revokeKey..."]
    T5["05\n👻 Orphan Queue\nCredentials created by the user\n(not just owned) are flagged\nand routed to their manager"]
    T6["06\n📄 Audit PDF\nTimestamped PDF: every revocation,\nevery credential affected,\nevery API response.\nSOC2-ready"]

    T1 --> T2 --> T3 --> T4 --> T5 --> T6

    style T1 fill:#fff3cd
    style T2 fill:#cfe2ff
    style T3 fill:#d1ecf1
    style T4 fill:#f8d7da
    style T5 fill:#e2d9f3
    style T6 fill:#d4edda
```

---

## Identity Graph — Core Schema

> Four entities model the entire credential universe. The graph is queried for blast radius traversal, offboarding, and compliance evidence.

```mermaid
erDiagram
    IDENTITY {
        uuid    id              PK
        string  email
        string  type
        string  owner_id        FK
        int     blast_debt_score
        timestamp created_at
    }

    CREDENTIAL {
        uuid      id             PK
        string    type
        string    service
        string    owner_id       FK
        int       blast_radius_score
        timestamp expires_at
        string    status
    }

    ACCESS_GRANT {
        uuid      id             PK
        string    resource
        string    requester_id   FK
        string    approver_id    FK
        int       duration_minutes
        timestamp expires_at
        string    status
    }

    AUDIT_EVENT {
        uuid      id             PK
        string    event_type
        string    actor_id       FK
        string    target_id
        string    prev_hash
        timestamp occurred_at
    }

    IDENTITY ||--o{ CREDENTIAL    : "owns"
    IDENTITY ||--o{ ACCESS_GRANT  : "requests"
    IDENTITY ||--o{ AUDIT_EVENT   : "triggers (actor)"
    CREDENTIAL ||--o{ AUDIT_EVENT : "triggers (target)"
```

---

## Technology Decisions

| Layer | Technology | Rationale |
|---|---|---|
| **CLI / Pre-commit** | **Rust** | Single static binary, 3ms startup, cross-platform. No runtime dependency. Installed via npm, pip, or curl. Fast enough to feel instant on every commit. |
| **Core API + Engines** | **Go (Golang)** | Goroutine-per-request concurrency ideal for I/O-heavy engine calls (CloudTrail, KMS, STS). Single binary deployment. Low memory footprint. |
| **IAM Analyzer** | **Python** | boto3, google-cloud SDK, and azure-sdk are mature in Python. NumPy for statistical usage analysis. LLM policy generation via OpenAI API. |
| **Dashboard + Web** | **Next.js** | SSR for initial load speed. React for complex identity graph visualizations. WebSocket for real-time blast radius updates. Tailwind for styling. |
| **Primary Database** | **PostgreSQL** | Identity graph via recursive CTEs (pg_graph optional). TimescaleDB extension for time-series audit events (partitioned by month, fast range queries). |
| **Cache + Queue** | **Redis** | JIT session TTL tracking (`EXPIREAT` per session key). Redis Streams for async revocation queue. Cache layer for blast radius scores (TTL: 5 min). |
| **Secret Store** | **S3-compatible** | Encrypted blobs stored in S3 (or GCS, MinIO for self-hosted). Object key = `sha256(org_id + credential_id)`. No metadata in object key. |
| **Auth Layer** | **OIDC + JWT** | Auth0 or self-hosted Keycloak. OAuth2 PKCE for dashboard. CLI uses device flow. API validates JWT on every request, checks scope per endpoint. |

---

## Security of CredOS Itself

> A security product that is not itself secure is the most dangerous kind. CredOS is designed to be the most paranoid customer of its own security model.

| Property | Guarantee |
|---|---|
| 🔒 **Zero-Knowledge Vault** | Customer-managed KMS — CredOS never holds a KEK. Cannot decrypt your secrets even under legal compulsion. Enforced **architecturally**, not by policy. |
| 👁️ **Read-Only Cloud Access** | IAM engine assumes a **read-only** IAM role in your cloud account. CredOS never requests write permissions to your infrastructure. Role policy is published and auditable. |
| 📜 **Append-Only Audit Log** | Every audit event is **hash-chained** (each event includes SHA-256 of the previous event). Tampering is detectable. The log cannot be deleted by any CredOS employee or customer admin. |
| ✍️ **Signed CLI Binary** | Every release signed with **Sigstore/cosign**. Installation scripts verify the signature before execution. Supply chain compromise is detectable by any installer. |
| 🛫 **Air-Gapped CLI Mode** | Pattern DB syncs once daily and operates fully offline. No code, file content, or file paths leave the developer's machine during local scan. Only metadata (secret type + hash prefix) is sent for blast radius scoring — and this is **opt-in**. |
| 📋 **SOC2 Type II (dog-food)** | CredOS runs its own product on its own infrastructure. SOC2 report is generated by its own compliance engine. First and most demanding customer of every feature shipped. |
| 👮 **RBAC within CredOS** | CredOS employees have **zero access** to customer data. Customer admin roles are scoped: `security-viewer` can read but not revoke. Bulk operations require MFA re-authentication. No shared credentials anywhere in CredOS infrastructure. |

---

*CredOS Technical Architecture · April 2026*
