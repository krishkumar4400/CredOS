# CredOS — Project Documentation

### Developer-First Credential Lifecycle Management

> **Version:** 1.0 — MVP Scope
> **Last updated:** April 2026
> **Status:** Pre-seed · Building v1

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Target Users & Personas](#4-target-users--personas)
5. [MVP Scope](#5-mvp-scope)
6. [User Flow](#6-user-flow)
7. [System Architecture](#7-system-architecture)
8. [Data Model](#8-data-model)
9. [Security Considerations](#9-security-considerations)
10. [Success Metrics](#10-success-metrics)
11. [Pricing Strategy](#11-pricing-strategy)
12. [Risks & Assumptions](#12-risks--assumptions)
13. [Roadmap](#13-roadmap)
14. [Competitive Positioning](#14-competitive-positioning)

---

## 1. Executive Summary

### What CredOS Is

CredOS is a credential lifecycle management platform built for startups that don't have a dedicated security team. It gives engineering teams a single place to see every credential their organization owns — AWS IAM keys, GitHub tokens, API keys, OAuth grants — track who owns each one, and revoke everything instantly when someone leaves.

### Why It Exists

Every startup accumulates credentials faster than it manages them. A developer joins, creates three AWS keys, connects a GitHub integration, adds an OpenAI API key, and wires up Stripe. Six months later, they leave. What gets revoked? Usually whatever the DevOps lead remembers to check in the next 48 hours. The rest lingers — sometimes for months — creating silent, invisible security exposure that no existing tool at a startup price point addresses.

### Who It Is For

- Startups between 10 and 100 engineers
- Teams using AWS, GitHub, and third-party APIs as their primary infrastructure
- Organizations without a dedicated security engineer or CISO

### Core Value Proposition

> **From credential chaos to complete visibility and instant, auditable offboarding — in under 15 minutes of setup. No security expertise required.**

CredOS is not a secrets manager you need a DevOps engineer to operate. It is not an enterprise CSPM priced for companies with $100K security budgets. It is the tool a CTO installs on a Friday afternoon and uses to clean up a departing engineer's access before they leave for their last commute.

---

## 2. Problem Statement

### The Credential Chaos Problem

Engineering teams create credentials constantly — every new service, every new integration, every new team member. Credentials are scattered across:

- AWS IAM console
- GitHub personal access token settings
- `.env` files on developer laptops
- Shared Slack messages and Notion pages
- CI/CD environment variable settings
- Individual developer accounts at third-party services

There is no single inventory. Nobody knows the complete picture.

### Real-World Scenarios

#### Scenario 1 — The departing engineer

A backend engineer leaves a 40-person startup. Their manager sends a checklist to IT: "revoke GitHub access, remove from Slack." Nobody checks their AWS IAM keys. Three months later, those keys — still active — are found in a public GitHub repo the engineer had in a personal side project. The keys had access to the production S3 bucket.

**Time between departure and discovery: 90 days. Cost: breach investigation + customer notification + reputational damage.**

#### Scenario 2 — The leaked OpenAI key

A junior developer builds an internal AI tool. They push the code to a private GitHub repo to show a colleague. Unknown to them, the repo was briefly set to public during a settings change. A bot scrapes the OpenAI API key within 4 minutes. By morning, $800 in API charges have been billed. Nobody knows until the monthly bill arrives.

**Time between leak and detection: 12+ hours. Cost: $800 in charges + 3 hours of incident investigation.**

#### Scenario 3 — The SOC2 audit gap

A startup pursues SOC2 Type II certification. The auditor asks: "Provide evidence that access was revoked for all employees who left in the past 12 months." The engineering team spends two weeks reconstructing events from Slack history, email threads, and AWS CloudTrail. They cannot account for 4 former contractors with certainty. The audit finding costs them the certification cycle.

**Time spent: 2 weeks. Cost: delayed certification, lost enterprise customer.**

### Why Current Tools Fail This Segment

| Tool | What it does | Why it fails for startups |
|---|---|---|
| HashiCorp Vault | Secrets management | Requires a dedicated DevOps engineer to operate. Overkill for 30-person teams. |
| AWS Secrets Manager | Secret storage for AWS workloads | AWS-only. No ownership tracking, no offboarding, confusing UX. |
| Doppler / Infisical | Environment variable management | Manages secrets for apps, not credential ownership for people. No offboarding concept. |
| Wiz / Orca | Cloud security posture management | $50,000+ per year. Enterprise sales cycle. No self-serve. |
| IAM Access Analyzer | AWS IAM analysis | Free but unactionable — identifies issues, offers no remediation or offboarding automation. |
| 1Password Teams | Password management | Built for human passwords, not developer credentials or IAM roles. |

**The gap:** No tool at the startup price point tracks credential ownership by person, enables one-click offboarding across multiple providers, and generates an audit log without requiring security expertise to operate.

---

## 3. Proposed Solution

### What CredOS Does

CredOS connects to a company's AWS account, GitHub organization, and third-party API providers. It discovers all credentials in those environments, lets the team assign an owner to each one, and enables instant, auditable revocation when a team member departs.

### How It Solves the Problem

**Step 1 — Discovery:** CredOS reads your AWS IAM users and access keys, your GitHub organization's personal access tokens, and any manually-added third-party API credentials. It builds a complete inventory automatically.

**Step 2 — Ownership:** Every credential is assigned to a person. The dashboard makes unowned ("orphaned") credentials immediately visible. Ownership assignment takes minutes via a bulk-edit table UI.

**Step 3 — Offboarding:** When someone leaves, the CTO selects their name. CredOS shows every credential they own across every connected provider. One click revokes all of them in parallel, logs each revocation with a timestamp, and generates a downloadable PDF audit report.

**Step 4 — Ongoing awareness:** Alerts fire when credentials approach expiry, when new unowned credentials are detected, or when a credential is used from an unexpected location.

### Key Differentiators

| Differentiator | How it works |
|---|---|
| **Ownership as a first-class concept** | Every credential has a named human owner. Orphaned credentials surface immediately. This concept does not exist in Doppler, Vault, or Secrets Manager. |
| **Offboarding as the primary workflow** | Most tools treat offboarding as an afterthought. CredOS is designed around it — the entire data model optimizes for "show me everything this person can access." |
| **Self-serve in under 15 minutes** | No sales call, no professional services, no DevOps expertise. A CTO can connect AWS and GitHub and run their first offboarding in one afternoon. |
| **Startup pricing** | $49/month flat for teams under 50 engineers. Not $500/month. Not $50,000/year. |

---

## 4. Target Users & Personas

### Persona 1 — Arjun, CTO & Co-founder

**Profile:** 32 years old. Co-founded a B2B SaaS startup 2 years ago. The team has grown from 5 to 35 engineers. Arjun writes code, reviews PRs, manages AWS, handles vendor contracts, and worries about security. He has no time to become a security expert.

**Pain points:**

- Has no idea how many API keys exist across the company at any given time
- When engineers leave, he personally runs a mental checklist that he knows is incomplete
- Preparing for SOC2 revealed credential management gaps that took weeks to reconstruct
- Tried to implement Vault; gave up after 3 days of setup with no working result
- Wakes up occasionally wondering if a former contractor's access is still live

**Goals:**

- Know what credentials exist, who owns them, and whether they're all necessary
- Be able to handle any offboarding in under 5 minutes with a paper trail
- Pass a SOC2 audit without a 2-week scramble
- Sleep without worrying about lingering access

**What CredOS means to Arjun:** The security audit and offboarding automation he would have built himself if he had the time. He pays $49/month to not think about this anymore.

---

### Persona 2 — Sneha, Senior DevOps Engineer

**Profile:** 28 years old. The only dedicated DevOps engineer at a 45-person product startup. Manages AWS, CI/CD pipelines, Kubernetes clusters, and on-call rotation. Has been asked to "sort out the secrets situation" three times and hasn't had the bandwidth to do it properly.

**Pain points:**

- IAM keys accumulate faster than she can audit them
- Has found credentials in `.env` files, Slack messages, and GitHub repos — all in the same week
- The current "process" for offboarding is a Notion checklist that hasn't been updated in 8 months
- Knows the AWS IAM policies are overprivileged but fixing them competes with 12 higher-priority tickets
- Doesn't want to implement Vault — "that's a project, not a tool"

**Goals:**

- A single view of all credentials and their owners without manual inventory work
- Alerts when something changes unexpectedly — new key created, old key used
- An offboarding process she can hand to any engineer on the team, not just herself
- Evidence she can hand to the security team during an audit without spending days on it

**What CredOS means to Sneha:** The tool she would have built on a weekend if weekends weren't full of on-call incidents. She becomes CredOS's internal champion because it replaces the Notion checklist she's embarrassed by.

---

### Persona 3 — Rohit, Backend Developer

**Profile:** 25 years old. Mid-level backend developer, 2 years at the company. Creates API integrations, writes Lambda functions, sets up CI/CD environment variables. Not a security person, doesn't think of himself as one.

**Pain points:**

- Has committed an API key to a GitHub repo before and felt terrible about it
- Regularly creates AWS resources for new features and is not sure how to set up IAM correctly
- Gets API keys from colleagues over Slack because there's no better way to share them
- Has no idea what credentials he "owns" in the company's infrastructure
- Thinks about security in terms of "I hope I haven't done anything wrong" not "I have visibility"

**Goals:**

- Know what credentials are attributed to him so he can keep them clean
- A way to share secrets with teammates that isn't Slack
- Get notified before a credential expires rather than after something breaks
- Not be the person who causes a security incident

**What CredOS means to Rohit:** Visibility and accountability. He can see his credentials in one place, know when they expire, and feel like a responsible engineer rather than someone hoping nothing goes wrong.

---

## 5. MVP Scope

### Design Principle

The v1 MVP has one job: **make offboarding instant and auditable**. Every feature either directly enables offboarding or creates the data model that makes offboarding possible. Anything else is v2.

### Core v1 Features

#### 1. Cloud provider connection

- Connect an AWS account via a read-only IAM role (CloudFormation template provided — one-click setup)
- Connect a GitHub organization via OAuth App installation
- Manual credential entry for Stripe, OpenAI, and other third-party API keys

#### 2. Credential inventory

- Automatic discovery of all IAM users and access keys from connected AWS accounts
- Automatic discovery of all personal access tokens for members of connected GitHub organizations
- Manual entry UI for third-party API credentials not automatically discoverable
- Inventory table showing: credential type, service, creation date, last used date, status

#### 3. Ownership assignment

- Bulk-assignable ownership table — assign any credential to any team member in one click
- "Orphaned credentials" view — all credentials with no assigned owner
- Team member directory synced from GitHub org or manually managed

#### 4. Offboarding flow

- Select a departing team member
- View all credentials assigned to them across all connected providers
- One-click bulk revocation — fires revocation API calls in parallel
- Per-credential status: success, failed, pending
- Downloadable PDF audit report with timestamps, credential IDs, and revocation confirmation

#### 5. Basic alerts

- Email alert when a new credential is detected with no owner assigned
- Email alert when a credential has not been rotated in 90 days
- Email alert when an offboarding is triggered (sent to org admin)

### What Is Explicitly NOT in v1

The following features are confirmed out of scope for v1. They are not "nice to have" — they are actively deprioritized to ship the core product faster.

```
Out of scope for v1:
✗ Pre-commit hook / secret scanning in git
✗ Secret vault storage with encryption (secrets are referenced, not stored)
✗ JIT (just-in-time) access requests
✗ Slack integration (email alerts only)
✗ IAM policy right-sizing / least-privilege recommendations
✗ Blast radius scoring
✗ Multi-cloud support (GCP, Azure)
✗ AI-generated policy patches
✗ Developer risk scoring
✗ API for programmatic access
✗ SSO / SAML
✗ Kubernetes service account management
✗ CI/CD secrets scanning
```

**Why these are excluded:** Each of these features is a project, not a feature. Adding any of them to v1 doubles the build time without proportionally increasing the chance that the first 10 customers pay. They will be added based on what paying customers ask for, not what seems architecturally satisfying.

---

## 6. User Flow

### Flow 1 — New user onboarding

```
1. SIGN UP
   └── Visit credos.dev
   └── Sign up with Google or GitHub (via Clerk)
   └── Create organization (name + team size)

2. CONNECT AWS
   └── Dashboard prompts: "Connect your first provider"
   └── User clicks "Connect AWS"
   └── CredOS displays a CloudFormation template link
   └── User opens AWS console, runs the 1-click CloudFormation stack
   └── Stack creates a read-only IAM role with a trust policy pointing to CredOS
   └── User pastes the Role ARN back into CredOS
   └── CredOS validates the role by making a test ListUsers call
   └── ✓ AWS connected — credential discovery begins immediately

3. CONNECT GITHUB
   └── User clicks "Connect GitHub"
   └── OAuth flow to install CredOS GitHub App on their organization
   └── CredOS reads org member list and their personal access tokens
   └── ✓ GitHub connected

4. VIEW CREDENTIAL INVENTORY
   └── Dashboard populates with discovered credentials
   └── All credentials initially show owner: "Unassigned"
   └── Banner: "You have 23 credentials — 23 need an owner assigned"

5. ASSIGN OWNERSHIP
   └── User opens Ownership table
   └── Dropdown per credential row — select team member
   └── Bulk select + assign for credentials belonging to the same person
   └── Dashboard updates: "23 credentials — 3 unassigned"
```

---

### Flow 2 — Adding a credential manually

```
1. User clicks "Add Credential" from dashboard
2. Selects service: Stripe / OpenAI / Custom
3. Enters:
   - Credential name (e.g. "Stripe Live Key - Payments Service")
   - Credential ID / last 4 chars (never the full secret)
   - Service
   - Owner (team member dropdown)
   - Expiry date (optional)
4. Clicks Save
5. Credential appears in inventory with status: Active
```

> **Note:** CredOS does not store the secret value in v1. It stores metadata only — the credential ID, type, service, and ownership. This removes the need for encryption infrastructure in v1 and is sufficient for offboarding (you need to know the key exists and who owns it; the provider handles the actual revocation).

---

### Flow 3 — Offboarding a team member

```
1. CTO navigates to "Offboarding" tab
2. Selects departing team member from dropdown
   └── CredOS immediately displays:
       - All credentials assigned to this person
       - Service, credential type, last used date
       - Revocation method (auto-revoke via API or manual with instructions)

3. Review screen:
   ┌──────────────────────────────────────────────────────┐
   │ Offboarding: Rahul Sharma                            │
   │ ─────────────────────────────────────────────────── │
   │ ✓ AWS IAM Key   AKIA...XJ7   Auto-revoke via API    │
   │ ✓ GitHub PAT    ghp_3xK...   Auto-revoke via API    │
   │ ⚠ Stripe Key    sk_live_4k   Manual — instructions  │
   │ ✓ OpenAI Key    sk-abc...    Auto-revoke via API    │
   └──────────────────────────────────────────────────────┘

4. User clicks "Revoke All"
5. CredOS fires parallel revocation calls
6. Results displayed in real time:
   └── ✓ AWS IAM key revoked — 14:32:07 UTC
   └── ✓ GitHub PAT revoked — 14:32:08 UTC
   └── ✗ Stripe key — manual revocation required (link to Stripe dashboard)
   └── ✓ OpenAI key revoked — 14:32:09 UTC

7. User clicks "Download Audit Report"
8. PDF generated and downloaded:
   └── Contains: org name, date, departing engineer, 
       each credential, revocation status, timestamp
   └── Footer: "Generated by CredOS — credos.dev"
```

---

## 7. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  Next.js Dashboard (Vercel)    ←→    CLI (Rust, optional in v1)    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTPS
┌──────────────────────────────────▼──────────────────────────────────┐
│                          API LAYER (Node.js + Fastify)              │
│  Auth middleware (Clerk JWT)  ·  Rate limiting  ·  Request logging  │
│                                                                     │
│  Routes:                                                            │
│  POST /connect/aws          — validate + store AWS role ARN         │
│  POST /connect/github       — handle GitHub App install callback    │
│  GET  /credentials          — list all org credentials              │
│  PUT  /credentials/:id/owner — assign owner                        │
│  POST /offboard             — trigger offboarding for a member      │
│  GET  /audit/:offboard_id   — download audit PDF                   │
└──────────┬───────────────────────┬───────────────────────┬──────────┘
           │                       │                       │
┌──────────▼──────┐   ┌────────────▼───────┐   ┌─────────▼──────────┐
│   PostgreSQL     │   │   Integration      │   │  PDF Generator     │
│   (Railway)      │   │   Layer            │   │  (html-pdf / PDFKit│
│                  │   │                    │   │   in Node.js)      │
│  - orgs          │   │  AWS SDK           │   │                    │
│  - members       │   │  @aws-sdk/iam      │   │  Generates audit   │
│  - credentials   │   │                    │   │  reports on demand │
│  - audit_events  │   │  GitHub SDK        │   └────────────────────┘
│  - integrations  │   │  @octokit/rest     │
└──────────────────┘   │                    │
                       │  Stripe / OpenAI   │
                       │  (direct REST)     │
                       └────────────────────┘
```

### Component Responsibilities

#### Frontend — Next.js on Vercel

- Dashboard: credential inventory table with ownership assignment
- Onboarding wizard: provider connection flows
- Offboarding wizard: review + confirm + revocation status in real time
- Uses React Query for server state, shadcn/ui for components
- Communicates with backend via REST API (JSON over HTTPS)

#### Backend — Node.js + Fastify on Railway

- Validates all requests against Clerk-issued JWTs
- Scopes all database queries to the authenticated org (`org_id` on every query)
- Orchestrates provider API calls via the integration layer
- Writes every credential event to the append-only `audit_events` table
- No business logic in the frontend — all state changes go through the API

#### Database — PostgreSQL on Railway

- Single Postgres instance for v1
- All tables include `org_id` for multi-tenancy isolation
- `audit_events` table is append-only — no UPDATE or DELETE operations run on it, enforced at the application layer
- Migrations managed with `node-pg-migrate` or `drizzle-kit`

#### Integration Layer

- AWS: uses `@aws-sdk/client-iam` — ListUsers, ListAccessKeys, DeleteAccessKey
- GitHub: uses `@octokit/rest` — list org members, list PATs, delete PAT via GitHub App
- Stripe / OpenAI: direct REST calls — no SDK required for the 2 endpoints needed
- Each integration is isolated behind a consistent interface:

```typescript
interface CredentialProvider {
  discover(orgId: string): Promise<DiscoveredCredential[]>
  revoke(orgId: string, credentialId: string): Promise<RevocationResult>
}
```

#### Auth — Clerk

- Handles signup, login, session management, and JWT issuance
- Backend validates JWT on every request
- Org isolation: Clerk org ID maps 1:1 to CredOS `orgs` table

---

## 8. Data Model

### Core Entities

#### `orgs` — One per company

```json
{
  "id": "uuid",
  "name": "Acme Technologies",
  "clerk_org_id": "org_2abc...",
  "plan": "starter",
  "created_at": "2026-04-01T10:00:00Z"
}
```

#### `members` — Team members tracked in CredOS

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "name": "Rahul Sharma",
  "email": "rahul@acme.io",
  "clerk_user_id": "user_2xyz...",
  "role": "engineer",
  "status": "active",
  "created_at": "2026-01-15T09:00:00Z"
}
```

**`status` values:** `active` | `offboarding` | `departed`

#### `credentials` — Every tracked credential

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "owner_id": "uuid | null",
  "service": "aws",
  "credential_type": "iam_key",
  "external_id": "AKIAIOSFODNN7EXAMPLE",
  "label": "Rahul's deployment key",
  "last_used_at": "2026-04-20T08:14:00Z",
  "expires_at": null,
  "status": "active",
  "revoked_at": null,
  "created_at": "2026-01-15T09:00:00Z"
}
```

**`service` values:** `aws` | `github` | `stripe` | `openai` | `custom`

**`credential_type` values:** `iam_key` | `pat` | `api_key` | `oauth_token`

**`status` values:** `active` | `revoked` | `expired` | `rotation_required`

> **Security note:** The `external_id` stores the key identifier (e.g. AWS access key ID), never the secret value. For display in the UI, only the last 4 characters are shown.

#### `integrations` — Provider connections per org

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "service": "aws",
  "config": {
    "role_arn": "arn:aws:iam::123456789012:role/CredOSReadOnly",
    "region": "us-east-1",
    "account_id": "123456789012"
  },
  "status": "connected",
  "last_synced_at": "2026-04-22T14:00:00Z",
  "created_at": "2026-01-10T12:00:00Z"
}
```

> **Note:** `config` stores non-secret configuration only. The Role ARN is not a secret — it identifies a role but grants no access without valid AWS credentials to assume it.

#### `audit_events` — Immutable event log

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "event_type": "credential.revoked",
  "actor_id": "uuid",
  "target_credential_id": "uuid",
  "target_member_id": "uuid | null",
  "metadata": {
    "service": "aws",
    "external_id": "AKIAIOSFODNN7EXAMPLE",
    "revocation_method": "api",
    "provider_response": "success"
  },
  "occurred_at": "2026-04-22T14:32:07Z"
}
```

**`event_type` values:**

- `credential.discovered` — new credential found during sync
- `credential.owner_assigned` — owner set or changed
- `credential.revoked` — credential successfully revoked
- `credential.revocation_failed` — revocation attempted but provider returned error
- `member.offboard_started` — offboarding flow initiated
- `member.offboard_completed` — all revocations attempted
- `alert.triggered` — an alert condition was met

### SQL Schema

```sql
CREATE TABLE orgs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  clerk_org_id TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  clerk_user_id TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'engineer',
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

CREATE TABLE credentials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  owner_id        UUID REFERENCES members(id) ON DELETE SET NULL,
  service         TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  external_id     TEXT NOT NULL,
  label           TEXT,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active',
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, service, external_id)
);

CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  service       TEXT NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'connected',
  last_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, service)
);

CREATE TABLE audit_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES orgs(id),
  event_type            TEXT NOT NULL,
  actor_id              UUID REFERENCES members(id),
  target_credential_id  UUID REFERENCES credentials(id),
  target_member_id      UUID REFERENCES members(id),
  metadata              JSONB NOT NULL DEFAULT '{}',
  occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credentials_org ON credentials(org_id);
CREATE INDEX idx_credentials_owner ON credentials(owner_id);
CREATE INDEX idx_credentials_status ON credentials(status);
CREATE INDEX idx_audit_events_org ON audit_events(org_id);
CREATE INDEX idx_audit_events_occurred ON audit_events(occurred_at);
CREATE INDEX idx_members_org ON members(org_id);
```

---

## 9. Security Considerations

### Credential Storage — What CredOS Does and Does Not Store

**v1 stores metadata only, not secrets.**

CredOS stores credential identifiers (e.g. AWS access key ID `AKIA...`), not secret values (e.g. the actual secret access key). This is sufficient for ownership tracking and offboarding — revocation uses the credential ID, not the secret value. This architecture eliminates the need for an encryption vault in v1 and reduces CredOS's attack surface significantly.

When customers ask "what happens if CredOS is breached?" the answer is: "An attacker would see a list of credential IDs and which team member owns them. They could not use those IDs to access your cloud accounts."

### AWS Integration — Read-Only by Design

CredOS assumes an IAM role in the customer's AWS account. That role is created by a CloudFormation template that CredOS provides. The template grants exactly these permissions — nothing more:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CredOSReadOnly",
      "Effect": "Allow",
      "Action": [
        "iam:ListUsers",
        "iam:ListAccessKeys",
        "iam:GetAccessKeyLastUsed"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CredOSRevoke",
      "Effect": "Allow",
      "Action": [
        "iam:DeleteAccessKey"
      ],
      "Resource": "*"
    }
  ]
}
```

The trust policy restricts role assumption to CredOS's specific AWS account and requires an external ID (a per-customer UUID), preventing confused deputy attacks.

### Authentication & Authorization

- All API endpoints require a valid Clerk JWT
- Every database query filters by `org_id` extracted from the JWT — no user can access another org's data regardless of what IDs they send in requests
- Admin-only operations (offboarding trigger, integration management) require the requesting user to have `role: admin` in the org
- Clerk handles session expiry, device management, and suspicious login detection

### Audit Log Integrity

The `audit_events` table is append-only at the application layer:

- No `UPDATE` or `DELETE` statements are issued against `audit_events` anywhere in the codebase
- Database user used by the application has `INSERT` and `SELECT` on `audit_events`, not `UPDATE` or `DELETE`
- The application-level constraint is documented and enforced in code review

For v2, hash-chaining (each event stores `SHA256` of the previous event's ID + timestamp) will be added to make tampering detectable.

### Data Transmission

- All communication between clients and the backend uses TLS 1.3
- AWS API calls use the AWS SDK's native signing (SigV4) over HTTPS
- GitHub API calls use the GitHub App's private key for authentication, rotated quarterly
- No credentials are logged in application logs — the logging middleware explicitly strips any field matching known credential patterns

### Trust Model Summary

```
What CredOS can do:
✓ List IAM users and access key IDs in your AWS account
✓ Delete a specific IAM access key when offboarding is triggered
✓ List personal access tokens for members of your GitHub organization
✓ Revoke a specific GitHub PAT when offboarding is triggered
✓ Store metadata (key IDs, ownership, timestamps) about your credentials

What CredOS cannot do:
✗ Read the secret values of your credentials
✗ Create new IAM users or access keys in your account
✗ Modify your IAM policies
✗ Access your S3 buckets, EC2 instances, or other AWS resources
✗ Access your code repositories or read repository contents
```

---

## 10. Success Metrics

### MVP Success Metrics (Day 0 → Day 30)

| Metric | Target | Why it matters |
|---|---|---|
| Users who complete full onboarding (connect AWS + GitHub) | 20+ | Validates that setup friction is low enough |
| Users who assign ownership to all discovered credentials | 15+ | Validates that the ownership concept resonates |
| Users who run at least one offboarding | 8+ | Validates the core workflow delivers value |
| User interviews completed | 15+ | Ensures decisions are grounded in real feedback |
| Net Promoter Score from first users | > 40 | Early signal on advocacy potential |

### Early Traction Signals (Day 30 → Day 60)

| Signal | What it indicates |
|---|---|
| 3+ paying customers at $49/month | The pain is real and the price is right |
| At least 1 customer runs offboarding within 48 hours of signing up | Time-to-value is short enough |
| At least 1 unprompted referral ("I told another CTO about this") | Word-of-mouth potential is present |
| Average time to complete onboarding < 15 minutes | Setup UX is working |
| < 10% of started offboardings abandoned before completion | The flow is clear and trustworthy |
| Customer says "I used this for our SOC2 audit" | Compliance use case is real |

### The Single Most Important Signal

After any user has run their first offboarding, ask them: *"If CredOS disappeared tomorrow and you went back to doing this manually, how would you feel?"*

If fewer than 3 out of 10 say "genuinely annoyed" or "I don't want to do that" — the problem is not acute enough, the solution is not differentiated enough, or the ICP is wrong. This signal outweighs all other metrics combined.

---

## 11. Pricing Strategy

### Design Principle

Price to eliminate friction for the first 10 customers. Price to capture value once the product is proven. Do not optimize for maximizing revenue from the first user — optimize for getting the product in front of enough people to learn quickly.

### v1 Tiers

#### Free

**Who it's for:** Solo founders, very early-stage teams, or evaluation

```
- Up to 5 team members tracked
- 1 AWS account connected
- GitHub connection included
- Credential inventory: unlimited
- Offboarding: up to 3 credentials per run
- PDF audit report: not included
- Alerts: email only, 1 alert type
```

**Free tier is not crippled — it works for small teams.** The paywall appears precisely at the moment of highest value: running a full offboarding with an audit PDF. This is correct placement.

#### Starter — $49/month

**Who it's for:** Startups with 10–80 engineers, no dedicated security team

```
- Unlimited team members
- 3 AWS accounts connected
- GitHub + Stripe + OpenAI connected
- Credential inventory: unlimited
- Offboarding: unlimited, all providers, parallel revocation
- PDF audit report: included
- Alerts: all alert types, email
- Support: email, 48-hour response
```

#### Team — $149/month *(launch in month 3, not month 1)*

**Who it's for:** Growing startups preparing for SOC2 or with a part-time security function

```
- Everything in Starter
- Unlimited AWS accounts
- Custom provider (manual entry with webhook revocation)
- SOC2 evidence export (formatted for auditors)
- Audit log export (CSV + JSON)
- Quarterly credential health report
- Support: email + Slack, 24-hour response
- Onboarding call: 30 minutes included
```

### How to Get the First Paid User

1. Offer free access with no time limit during the validation phase (first 30 days)
2. When a user has successfully run an offboarding, reach out personally: *"You just saved yourself 3 hours — would you be willing to pay $49/month to have this available whenever you need it?"*
3. If they hesitate on price, ask what they would pay before discounting. The answer tells you more than a discount tells them.
4. The first paid transaction should come from a phone call, not a form. Real trust precedes real money.

### What Not to Do on Pricing

- Do not offer annual discounts before you have monthly retention data
- Do not create a per-seat model in v1 — it adds friction to every new hire conversation
- Do not price below $29/month — below that threshold, buyers mentally classify the product as "not serious"
- Do not run ads before you have 5 paying customers — ads amplify conversion rate, they don't create it

---

## 12. Risks & Assumptions

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GitHub's PAT listing API requires each user to individually authorize the GitHub App | High | Medium | v1 uses org-level admin token scope; document the limitation clearly in onboarding |
| AWS revocation API call fails mid-offboarding (network error, permission issue) | Medium | High | Implement retry logic with exponential backoff; mark failed revocations clearly in UI; never report success until confirmed |
| Customer's AWS read-only role has insufficient permissions (misconfigured CloudFormation) | Medium | Medium | Validate the role immediately on connection with a test API call; provide clear error messages with exact fix instructions |
| PDF generation at scale is slow | Low | Low | Generate PDFs asynchronously, notify via email when ready; not a launch-day concern |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Target customers use Okta or Rippling — problem is already "solved" for them | Medium | High | Pre-qualify ICP: explicitly target companies NOT using SSO. These are 20–60 person startups that grew organically on AWS + GitHub without IT infrastructure |
| Customers want secret storage, not just metadata tracking — find v1 insufficient | Medium | Medium | Be explicit in marketing that v1 is credential management, not secret storage. This is positioning, not a bug. Ship vault storage in v2 if 5+ customers ask for it. |
| Offboarding frequency is too low — customers onboard and then don't return for 6 months | Medium | High | Add monitoring value (alerts, credential health) to create regular engagement between offboarding events |
| Manual Stripe/OpenAI credential entry has too much friction | High | Low | For v1 this is acceptable — auto-discovery for these providers is a v2 feature. Communicate the manual step as a known limitation. |

### Adoption Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CTOs don't feel the pain acutely enough to pay $49/month | Low | Critical | Validate pain before building: 10+ user interviews before writing any code |
| Security concern: "I'm not comfortable connecting my AWS account to a third party" | Medium | High | Zero-knowledge architecture documentation, read-only IAM role with explicit policy, prominent trust page on website |
| Competitor launches a similar product at the same price point | Low | Medium | Speed of execution and customer relationships are the moat at this stage. Ship, get customers, build switching cost. |

### Key Assumptions

The business model depends on all three of these being true:

1. **Startups of 10–80 engineers have experienced a bad offboarding.** (Test: ask directly in sales conversations)
2. **The current "process" is a mental checklist or a Notion doc, not an automated system.** (Test: ask to see their current process)
3. **A CTO will pay $49/month without a procurement process.** (Test: attempt to charge the first 5 users before discounting)

---

## 13. Roadmap

### v1 — The Offboarding Platform *(Months 1–3)*

**Theme:** One job, done perfectly.

```
Core features:
✓ AWS + GitHub + manual credential discovery
✓ Ownership assignment
✓ One-click offboarding with parallel revocation
✓ PDF audit report
✓ Basic email alerts (orphaned credentials, rotation reminders)
✓ Free + $49/month pricing tiers

Success criteria:
→ 10 paying customers
→ 3 unprompted referrals
→ Average onboarding time < 15 minutes
→ Zero critical bugs in offboarding flow
```

---

### v2 — Continuous Visibility *(Months 4–6)*

**Theme:** From reactive (offboarding) to proactive (ongoing credential health).

```
New features:
□ Slack integration — alerts and offboarding approvals via Slack
□ Credential health dashboard — rotation status, age, last-used heatmap
□ Multi-AWS account support
□ Stripe + OpenAI auto-discovery (via API integration, not manual entry)
□ SOC2 evidence export — formatted audit log for auditors
□ Team — $149/month tier launch

Key decision: what do 80% of paying v1 customers ask for next?
Build that, not this list.
```

---

### v3 — The Identity Layer *(Months 7–12)*

**Theme:** From credential tracking to identity governance.

```
New features:
□ Pre-commit hook (optional) — catch secrets before git commit
□ Just-in-time (JIT) access — Slack-native temporary access requests
□ IAM right-sizing — identify overprivileged roles with usage data
□ AI agent identity governance — track and scope LLM/AI tool credentials
□ Blast radius scoring — "if this credential leaks, estimated impact: $X"
□ API access — programmatic access for CI/CD integration
□ SSO / SAML — enterprise authentication for larger teams

Positioning shift:
v1: "Offboarding tool"
v2: "Credential management platform"
v3: "Identity operating system for developer teams"
```

---

### Feature Gate Discipline

A feature moves from "planned" to "building" only when:

- At least 3 paying customers have explicitly requested it, **or**
- It directly reduces churn in a measurable way, **or**
- It enables a pricing tier that would unlock a new customer segment

Features that don't meet this bar stay in the backlog regardless of how good they sound.

---

## 14. Competitive Positioning

### Competitive Landscape

```
                    HIGH PRICE
                        │
         Wiz ●          │         ● Orca
         Prisma ●        │
                         │
  ────────────────────────────────────────
  COMPLEX UX             │             SIMPLE UX
  (Requires security     │             (Self-serve,
   expert to operate)    │              developer-friendly)
                         │
        Vault ●          │         ● CredOS
    Secrets Mgr ●        │
        Doppler ●────────┼──────── ●
                         │
                    LOW PRICE
```

### Head-to-Head Comparison

| Capability | CredOS v1 | HashiCorp Vault | Doppler | AWS Secrets Manager | GitGuardian |
|---|---|---|---|---|---|
| **Setup time** | < 15 min | Days to weeks | 1–2 hours | 1–2 hours | 30–60 min |
| **Credential ownership tracking** | ✓ Core feature | ✗ | ✗ | ✗ | ✗ |
| **One-click offboarding** | ✓ Core feature | ✗ | ✗ | ✗ | ✗ |
| **Multi-provider (AWS + GitHub + Stripe)** | ✓ | ✓ (complex) | ✓ (env vars only) | AWS only | GitHub only |
| **PDF audit report** | ✓ | Manual | ✗ | Manual | ✗ |
| **Self-serve, no sales call** | ✓ | ✗ | ✓ | ✓ | ✗ (enterprise) |
| **Price for 30-person startup** | $49/mo | $200–2,000/mo (infra) | $100–300/mo | $0 + complexity | $500+/mo |
| **Requires security expertise** | ✗ | ✓ | Partial | ✓ | Partial |
| **Secret value storage** | ✗ (v1) | ✓ | ✓ | ✓ | ✗ |

### Where Competitors Fail This Segment

**HashiCorp Vault:** Built for infrastructure teams who can dedicate time to operating it. For a 30-person startup, Vault is a 3-day setup project that requires ongoing maintenance. The operational burden is the product.

**Doppler / Infisical:** Excellent at secret injection for applications. Not designed for the question "who owns this credential and what happens when they leave?" Doppler manages secrets for services, not ownership for people.

**AWS Secrets Manager:** Stores secrets for AWS workloads only. No concept of team ownership, no offboarding workflow, and a UX that requires AWS console expertise. Free but not simple.

**GitGuardian:** Detects leaks after the fact. Enterprise pricing ($500+/month). No offboarding, no ownership tracking, no remediation guidance. Alerts without action.

**Wiz / Orca / Prisma:** Full cloud security posture management at $50,000+ per year. Requires a CISO to evaluate and implement. Completely wrong price point and persona for the 30-person startup.

### The Gap CredOS Occupies

No tool at the startup price point answers these three questions simultaneously:

1. **What credentials does my organization have?** *(inventory)*
2. **Who owns each one?** *(ownership)*
3. **What do I do when someone leaves?** *(offboarding)*

Every existing tool answers one or two of these. CredOS answers all three in a single workflow, at a price point a CTO approves without a procurement process, with a setup time measured in minutes rather than days.

### Defensible Position Over Time

The competitive moat builds as follows:

- **Month 1–6:** Speed and price. Doppler and Vault cannot quickly build an offboarding workflow without rearchitecting their data model.
- **Month 6–18:** Compliance evidence. Customers with 12 months of SOC2 audit history in CredOS cannot easily recreate that history elsewhere.
- **Month 18+:** Identity graph data. The aggregated, anonymized data on credential patterns across thousands of startups becomes the foundation for predictive risk scoring — a capability no individual startup could build for itself.

---

*This document covers CredOS v1 — MVP scope only. Architecture, pricing, and feature decisions will evolve based on what paying customers validate. The most important sentence in this document is the one in Section 12: validate the three key assumptions before writing significant code.*

---

**Document maintained by:** CredOS founding team
**Next review:** After first 10 paying customers or Day 60 — whichever comes first
