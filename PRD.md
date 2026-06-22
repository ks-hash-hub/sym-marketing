# Product Requirements Document: Symphonic Marketing Intel Dashboard

**Document Version:** 1.0  
**Date:** June 22, 2026  
**Author:** Lorenzo (OpenClaw AI Development Co-worker)  
**Project:** Symphonic Marketing Intelligence Dashboard  
**Status:** Draft for Review  

---

## Executive Summary

The **Symphonic Marketing Intel Dashboard** is a real-time marketing intelligence platform designed to centralize, analyze, and visualize music release data, DSP performance metrics, and campaign effectiveness for Symphonic Distribution's marketing team. The dashboard integrates with Airtable as the single source of truth and provides actionable insights through data-driven scoring, prioritization, and trend analysis.

**Key Value Propositions:**
- **Centralized Intelligence:** Unified view of release schedules, artist metrics, playlist pickups, and marketing drivers
- **Proactive Decision Making:** Automated scoring system identifies high-potential releases requiring attention
- **Operational Efficiency:** Reduces manual data aggregation and enables Tuesday review workflows
- **Performance Tracking:** Historical pickup trends and DSP performance analytics
- **Team Coordination:** Lead assignment tracking and workload visibility

**Target Deployment:** Google Cloud Platform (GCP)  
**Timeline:** 8-12 weeks (see Implementation Phases)  
**Estimated Monthly Cost:** $150-300 (GCP infrastructure + Airtable API usage)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Product Vision & Goals](#product-vision--goals)
3. [Target Users](#target-users)
4. [Feature Requirements](#feature-requirements)
5. [Airtable Integration Requirements](#airtable-integration-requirements)
6. [Technical Architecture (GCP)](#technical-architecture-gcp)
7. [Data Model & Scoring Engine](#data-model--scoring-engine)
8. [Security & Authentication](#security--authentication)
9. [Performance & Scalability](#performance--scalability)
10. [Cost Estimates](#cost-estimates)
11. [Implementation Phases](#implementation-phases)
12. [Success Metrics](#success-metrics)
13. [Risk Assessment](#risk-assessment)
14. [Open Questions](#open-questions)

---

## Current State Analysis

### What Exists in the Repository

The repository (`ks-hash-hub/sym-marketing`) contains a **React 18.3.1 + Vite** prototype with the following components:

**Tech Stack:**
- **Frontend:** React 18.3.1 with functional components and hooks
- **Build System:** Vite 5.4.2
- **Charting Library:** Recharts 2.12.7 (Area, Bar, Pie, Line, Radar charts)
- **Styling:** Inline CSS-in-JS with dark theme palette
- **Data Layer:** JSON fallback files + Airtable API integration layer (partially implemented)

**Core Features (Implemented):**
1. **Command Center View:**
   - Priority releases dashboard (scored and ranked)
   - This week by lead (grouped release assignments)
   - Release volume timeline (bar chart by week)
   - KPI cards (this week, priority 1 count, EI flags, total pickups, cover slots)

2. **Releases View:**
   - Filterable/sortable release table (priority, genre, territory, lead, EI flags)
   - Tuesday Review Mode (P1/P2 releases, next 4 weeks)
   - Missing Story filter
   - Slide-in detail panel (ArtistPanel component)
   - Platform readiness dots (Spotify, Apple Music, Amazon Music, Tidal)

3. **Performance View:**
   - Weekly pickup trend (14-week line chart)
   - Pickups by DSP (bar chart)
   - Pickups by marketing lead (horizontal bar chart)
   - Genre distribution (pie chart)
   - 1st party vs 3rd party pickup tracking

4. **Artist Profile Page:**
   - Artist-specific deep dive (component exists but details TBD)
   - Linked from release rows

**Scoring Engine:**
- **Symphonic Score** (0-100 scale):
  - Pickup History (0-25): 1st party pickups × 4 + 3rd party × 2 + cover slot bonus
  - Audience Reach (0-20): Log-scaled Spotify monthly listeners
  - Social Audience (0-20): Weighted IG/TikTok/YouTube/Twitter/SoundCloud followers
  - Marketing Drive Quality (0-20): Driver count + press + ad details
  - Release Consistency (0-15): Historical release cadence score

**Data Sources (Current):**
- **Demo Mode:** Static JSON files in `src/data/` (releases, pickups, driverData, organicEditorial, pastReleases, similarArtistPickups, ugcPlaylists)
- **Live Mode:** Airtable API integration (`src/api/airtable.js`)
  - Tables: Release Schedule, Drivers Submissions, Pickup
  - Requires `VITE_AIRTABLE_TOKEN` and `VITE_AIRTABLE_BASE` environment variables

**Airtable Integration Status:**
- ✅ Fetch functions implemented for releases, drivers, pickups
- ✅ Pagination handling
- ✅ Field mapping and transformations
- ✅ Fallback to demo data when token is missing
- ⚠️ No write operations (dashboard is read-only)
- ⚠️ No caching layer (every load fetches fresh data)
- ⚠️ No error retry logic

**Missing Infrastructure:**
- No deployment configuration (Dockerfile, Cloud Run YAML)
- No CI/CD pipeline
- No environment management (dev/staging/prod)
- No monitoring or logging
- No authentication layer
- No user management

---

## Product Vision & Goals

### Vision Statement
"Empower Symphonic's marketing team with real-time, data-driven intelligence to maximize release impact and streamline campaign planning through unified visibility into artist performance, DSP placements, and marketing drivers."

### Primary Goals

1. **Operational Efficiency**
   - Reduce time spent aggregating release data from multiple sources by 70%
   - Enable Tuesday review workflows to be completed in <30 minutes
   - Automate priority scoring and anomaly detection

2. **Strategic Decision Making**
   - Surface high-potential releases requiring immediate attention
   - Identify releases missing critical marketing components (story, drivers)
   - Track marketing effectiveness across leads, genres, and DSPs

3. **Team Alignment**
   - Provide shared visibility into workload distribution
   - Enable cross-functional coordination (marketing leads, client managers, labels)
   - Track release readiness across platforms

4. **Performance Measurement**
   - Quantify pickup success rates by genre, priority, and lead
   - Monitor weekly trend changes and seasonal patterns
   - Benchmark current releases against historical performance

### Non-Goals (Out of Scope for V1)

- ❌ Campaign management or task tracking (use Monday.com/Asana for this)
- ❌ Direct DSP API integrations (Spotify, Apple Music analytics)
- ❌ Email notifications or alerts (Phase 2 consideration)
- ❌ Mobile app (responsive web UI only)
- ❌ Write-back to Airtable (dashboard is read-only intelligence layer)

---

## Target Users

### Primary User: Marketing Lead
**Personas:** AJ, Greg, Jeanette (mentioned in demo data)

**Needs:**
- Quick overview of upcoming releases assigned to them
- Identify P1 releases missing submissions or drivers
- Track pickup performance for their roster
- Tuesday review preparation (P1/P2 releases, next 4 weeks)

**Usage Pattern:** Daily check-ins (morning), detailed review on Tuesdays

---

### Secondary User: Marketing Manager/Director

**Needs:**
- High-level KPIs across all leads
- Identify bottlenecks or under-performing releases
- Resource allocation insights (workload per lead)
- Historical performance trends

**Usage Pattern:** Weekly reviews, ad-hoc strategic planning

---

### Tertiary User: Client Manager

**Needs:**
- Artist-specific performance data
- Pickup history and social metrics
- Release readiness status
- Similar artist benchmarks

**Usage Pattern:** Ad-hoc lookups when client asks for updates

---

## Feature Requirements

### FR-001: Command Center Dashboard

**Priority:** P0 (Must-Have)

**Description:** Real-time snapshot of critical marketing intelligence

**Acceptance Criteria:**
- [ ] Display KPI cards: This Week count, P1 count, EI flags, Total Pickups, Cover Slots
- [ ] Show top 10 priority releases ranked by Symphonic Score
- [ ] Group this week's releases by marketing lead with P1/P2/P3 counts
- [ ] Display release volume timeline (next 4 weeks, stacked by priority)
- [ ] Highlight releases missing driver submissions with warning icons
- [ ] Page load time <2 seconds with live Airtable data
- [ ] Auto-refresh every 5 minutes (configurable)

---

### FR-002: Release Management View

**Priority:** P0 (Must-Have)

**Description:** Comprehensive filterable/sortable release table

**Acceptance Criteria:**
- [ ] Display all releases within 60-day window (past 7 days + next 53 days)
- [ ] Filters: Priority, Genre, Territory, Lead, EI Only, Missing Story
- [ ] Sort options: Date, Priority, Artist, Pickups, Spotify ML, Score
- [ ] Tuesday Review Mode toggle (P1/P2 only, next 28 days)
- [ ] Inline platform readiness indicators (Spotify, Apple, Amazon, Tidal)
- [ ] Click row to open slide-in detail panel
- [ ] Export to CSV (bonus feature)

---

### FR-003: Artist Detail Panel

**Priority:** P0 (Must-Have)

**Description:** Slide-in panel with artist-specific metrics and drivers

**Acceptance Criteria:**
- [ ] Display artist name, release title, UPC, date, genre, priority
- [ ] Show Symphonic Score breakdown (pickup history, audience, social, drive, consistency)
- [ ] List all marketing drivers with status indicators
- [ ] Display "What's the Story?" pitch text
- [ ] Show pickup history (last 12 months, grouped by DSP)
- [ ] Link to Spotify, Apple Music, pre-save pages
- [ ] "View Full Profile" button navigates to Artist Profile Page

---

### FR-004: Performance Analytics

**Priority:** P1 (Should-Have)

**Description:** Historical pickup trends and DSP performance

**Acceptance Criteria:**
- [ ] Weekly pickup trend chart (last 14 weeks, 1st party vs 3rd party)
- [ ] Pickups by DSP (bar chart with DSP brand colors)
- [ ] Pickups by marketing lead (horizontal bar chart)
- [ ] Genre distribution (pie chart)
- [ ] Cover slot tracking (this month count)
- [ ] Date range selector (last 30/60/90 days)

---

### FR-005: Artist Profile Page

**Priority:** P2 (Nice-to-Have)

**Description:** Deep-dive artist intelligence page (linked from Command Center and Release rows)

**Acceptance Criteria:**
- [ ] Artist overview card (name, label, genre, Spotify ML, IG followers)
- [ ] All-time pickup history timeline
- [ ] Similar artist comparisons (pickup success rate, audience size)
- [ ] Release history (past 12 months)
- [ ] Social media growth trends (if data available)
- [ ] UGC playlist placements

---

### FR-006: Insights Engine

**Priority:** P1 (Should-Have)

**Description:** Automated alerts and anomaly detection

**Acceptance Criteria:**
- [ ] Alert: "X Priority 1 releases drop this week"
- [ ] Alert: "Y Priority 1 releases missing pitch story"
- [ ] Alert: "Z Priority 1 releases have no pickup history"
- [ ] Highlight: "A cover slots secured this month"
- [ ] Dismissible alerts (persist dismissal state)

---

### FR-007: Tuesday Review Mode

**Priority:** P0 (Must-Have)

**Description:** Dedicated workflow for weekly marketing meetings

**Acceptance Criteria:**
- [ ] Toggle activates: show only P1/P2, next 28 days, sorted by date
- [ ] Display banner: "📅 Tuesday Review Mode — P1 + P2 releases within the next 4 weeks · X releases"
- [ ] Group by marketing lead with expandable sections
- [ ] Print-friendly view (bonus)

---

## Airtable Integration Requirements

### Airtable Base Structure

**Base ID:** `apppQyOGTr6uGeYZd` (configurable via environment variable)

**Required Tables:**

#### Table 1: Release Schedule (`tblG0xtGOTXKbW7Bw`)

**Fields (read-only):**
- `UPC CODE` (text)
- `ARTIST NAME (FOR ZAP)` (lookup, multiple values → take first)
- `Release*` (formula → release title)
- `DATE` (date)
- `GENRE` (single select)
- `SUBGENRE` (single select)
- `PRIORITY LEVEL` (single select: "High Priority", "Medium Priority", "Low Priority")
- `MARKETING LEADS` (multiple collaborators → extract name)
- `EDITORIAL INCLUSION` (checkbox)
- `EDITORIAL INCLUSION - UK/EU` (checkbox)
- `TERRITORY` (multiple selects → take first)
- `PRIORITY OVERRIDE` (multiple selects → array)
- `SPOTIFY ML (from ARTIST)` (lookup, multiple values → take first)
- `IG FOLLOWERS (from ARTIST)` (lookup, multiple values → take first)
- `LABEL` (text)
- `WHAT'S THE STORY?` (long text)

**Filter Formula (dashboard fetches):**
```
AND(
  IS_AFTER({DATE}, DATEADD(TODAY(), -8, 'days')),
  IS_BEFORE({DATE}, DATEADD(TODAY(), 61, 'days'))
)
```

**Sort:** `DATE` ascending

---

#### Table 2: Drivers Submissions (`tbl04m1kqODv3lNUm`)

**Fields (read-only):**
- `UPC` (text)
- `ARTIST` (text)
- `RELEASE` (text)
- `RELEASE DATE` (date)
- `WHAT'S THE STORY` (long text)
- `SIMILAR ARTISTS / FOR FANS OF` (long text)
- `MOOD` (multiple selects)
- `SONG STYLES` (multiple selects)
- `UPCOMING SHOWS` (long text)
- `AD DETAILS` (long text)
- `CONFIRMED PRESS` (long text)
- `MARKETING DRIVERS (MS)` (multiple selects)
- `SONG CHARACTERISTICS` (multiple selects)

**Filter Formula (dashboard fetches):**
```
OR({UPC}="upc1", {UPC}="upc2", ...) // max 50 UPCs per query
```

**Note:** Dashboard fetches drivers AFTER loading releases, using UPC list from releases.

---

#### Table 3: Pickup (`tbl8y6oVi2GjYgu7U`)

**Fields (read-only):**
- `PLAYLIST` (text)
- `DSP` (single select)
- `Release` (formula → array of release titles)
- `ARTIST` (formula → artist string)
- `1ST or 3RD` (single select: "1st Party", "3rd Party")
- `DATE SENT` (date)
- `MARKETING LEAD` (multiple selects → take first)
- `COVER` (checkbox)

**Filter Formula (dashboard fetches):**
```
IS_AFTER({DATE SENT}, DATEADD(TODAY(), -365, 'days'))
```

**Sort:** `DATE SENT` descending

---

### API Requirements

**Authentication:**
- Personal Access Token (read scope: `data.records:read`)
- Token stored in environment variable: `VITE_AIRTABLE_TOKEN`
- Never committed to git or exposed in client-side code

**Rate Limits:**
- Airtable free/pro tier: 5 requests/second per base
- Dashboard implementation uses automatic pagination (100 records/page)
- Implement exponential backoff for 429 responses

**Caching Strategy:**
- **Client-side cache:** 5-minute TTL (configurable)
- **Server-side cache:** Redis or Cloud Memorystore (Phase 2)
- **Invalidation:** Manual refresh button, auto-refresh timer

**Error Handling:**
- Fallback to demo JSON data on API failure
- Display warning banner: "⚠ fallback active" with error tooltip
- Log errors to Cloud Logging for monitoring

**Data Transformation:**
- Priority Level mapping: "High Priority" → "Priority 1", "Medium Priority" → "Priority 2", "Low Priority" → "Priority 3"
- Driver data keyed by BOTH artist name AND UPC for flexible lookup
- Pickup history grouped by artist name for release scoring

---

## Technical Architecture (GCP)

### High-Level Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Users (Browser)                          │
│              (Marketing Leads, Managers, Clients)               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Cloud Load Balancer                          │
│              (Global HTTPS LB + Cloud Armor WAF)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Cloud CDN (Static Assets)                      │
│            (React bundle, images, fonts cached)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Cloud Storage Bucket                       │
│              (Static site hosting: index.html, JS)              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓ API calls (from browser JS)
┌─────────────────────────────────────────────────────────────────┐
│                      Cloud Run Service                          │
│          (Node.js backend: Airtable proxy + caching)            │
│              - Express.js REST API                              │
│              - Airtable SDK                                     │
│              - Redis client (cache)                             │
│              - IAP authentication middleware                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              Cloud Memorystore (Redis)                          │
│          (5-minute TTL cache for Airtable responses)            │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓ Airtable API calls
┌─────────────────────────────────────────────────────────────────┐
│                      Airtable API                               │
│          (External: api.airtable.com/v0/{base}/{table})         │
└─────────────────────────────────────────────────────────────────┘

Supporting Services:
- Cloud Secret Manager: Store Airtable token
- Cloud Logging: Centralized logs (backend + frontend errors)
- Cloud Monitoring: Uptime checks, latency alerts
- Cloud Build: CI/CD pipeline (GitHub → Cloud Run)
- Identity-Aware Proxy (IAP): Google Workspace SSO
```

---

### Infrastructure Components

#### 1. Frontend: Cloud Storage + Cloud CDN

**Purpose:** Serve static React SPA with global caching

**Configuration:**
- **Bucket:** `symphonic-marketing-dashboard-prod`
- **Lifecycle:** Public read, no versioning (immutable builds)
- **Cloud CDN:** Enabled with 1-hour cache TTL for JS/CSS, 7-day TTL for images
- **Custom Domain:** `marketing.symphonicplatform.com` (Cloud DNS + SSL cert)
- **Index/404:** `index.html` (SPA fallback routing)

**Build Process:**
```bash
npm run build
gsutil -m rsync -r -c -d dist/ gs://symphonic-marketing-dashboard-prod/
```

**Cost:** ~$5/month (storage) + ~$10/month (CDN egress for 1000 users)

---

#### 2. Backend API: Cloud Run

**Purpose:** Proxy Airtable API with caching, auth, and rate limiting

**Service Spec:**
- **Container:** Node.js 20 + Express.js
- **Region:** `us-central1` (same as Cloud Memorystore)
- **CPU:** 1 vCPU, 512 MB memory
- **Min Instances:** 0 (scale to zero)
- **Max Instances:** 10
- **Concurrency:** 80 requests/container
- **Timeout:** 60 seconds
- **IAM:** Require authentication (IAP or service account)

**Endpoints:**
- `GET /api/releases` → Fetch release schedule (with cache)
- `GET /api/drivers?upcs=...` → Fetch driver submissions by UPC list
- `GET /api/pickups` → Fetch pickup history (last 365 days)
- `GET /api/health` → Health check (no auth required)
- `POST /api/cache/invalidate` → Manual cache clear (auth required)

**Environment Variables:**
- `AIRTABLE_TOKEN` (from Secret Manager)
- `AIRTABLE_BASE` (from Secret Manager or env)
- `REDIS_HOST` (Cloud Memorystore IP)
- `REDIS_PORT` (6379)
- `CACHE_TTL_SECONDS` (300 = 5 minutes)
- `NODE_ENV` (production)

**Docker Image:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

**Cost:** ~$10/month (avg 2000 requests/day, 10ms avg latency)

---

#### 3. Cache: Cloud Memorystore (Redis)

**Purpose:** Cache Airtable API responses to reduce rate limiting and latency

**Configuration:**
- **Tier:** Basic (non-replicated)
- **Region:** `us-central1`
- **Memory:** 1 GB
- **Network:** VPC peering with Cloud Run
- **Eviction Policy:** `allkeys-lru`

**Cache Keys:**
- `releases:latest` → JSON array (TTL: 5 minutes)
- `drivers:{upc}` → JSON object (TTL: 5 minutes)
- `pickups:latest` → JSON array (TTL: 5 minutes)

**Cost:** ~$50/month (1 GB Basic tier)

---

#### 4. Authentication: Identity-Aware Proxy (IAP)

**Purpose:** Restrict dashboard access to Symphonic Google Workspace users

**Configuration:**
- Enable IAP on Cloud Load Balancer backend
- OAuth consent screen: Internal (symphonicdistribution.com)
- Authorized users: `@symphonicdistribution.com` domain
- No additional backend auth required (IAP injects `X-Goog-Authenticated-User-Email` header)

**Cost:** Free (IAP itself has no cost, LB is $18/month base)

---

#### 5. CI/CD: Cloud Build

**Purpose:** Automated deployment from GitHub pushes

**Triggers:**
- **Production:** Push to `main` branch → build frontend + backend → deploy Cloud Run + sync Cloud Storage
- **Staging:** Push to `staging` branch → deploy to staging environment

**cloudbuild.yaml:**
```yaml
steps:
  # Build frontend
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['install']
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'build']
  
  # Deploy frontend to Cloud Storage
  - name: 'gcr.io/cloud-builders/gsutil'
    args: ['rsync', '-r', '-c', '-d', 'dist/', 'gs://symphonic-marketing-dashboard-prod/']
  
  # Build backend Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/marketing-dashboard-backend:$SHORT_SHA', './backend']
  
  # Push image to GCR
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/marketing-dashboard-backend:$SHORT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'marketing-dashboard-backend'
      - '--image=gcr.io/$PROJECT_ID/marketing-dashboard-backend:$SHORT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'  # IAP handles auth at LB level
      - '--set-env-vars=NODE_ENV=production'
      - '--set-secrets=AIRTABLE_TOKEN=airtable-token:latest'
```

**Cost:** ~$0/month (free tier covers small projects)

---

#### 6. Monitoring & Logging

**Cloud Logging:**
- Backend API logs (request/response, errors)
- Frontend error logs (via browser console forwarding to Cloud Logging API)
- Airtable API error logs

**Cloud Monitoring:**
- **Uptime Check:** HTTPS GET to `/api/health` every 1 minute
- **Latency Alert:** P95 latency >2 seconds for 5 minutes → Slack notification
- **Error Rate Alert:** >5% 5xx responses for 5 minutes → Slack notification
- **Airtable Rate Limit Alert:** 429 responses detected → Slack notification

**Cost:** ~$10/month (within free tier for small projects)

---

### Architecture Decision Records

**ADR-001: Why Cloud Run instead of Compute Engine?**
- **Decision:** Use Cloud Run (serverless containers)
- **Rationale:** Lower operational overhead, auto-scaling, cost efficiency (pay per request), zero-downtime deployments
- **Trade-off:** Slightly higher cold start latency (~500ms), but acceptable for this use case

**ADR-002: Why Cloud Storage + CDN instead of Cloud Run for frontend?**
- **Decision:** Serve static assets from Cloud Storage with Cloud CDN
- **Rationale:** Lower cost, better global performance, simpler deployment, CDN caching reduces origin load
- **Trade-off:** Requires separate backend API (cannot use Cloud Run for both frontend + backend in single service)

**ADR-003: Why Memorystore (Redis) instead of Cloud Datastore?**
- **Decision:** Use Memorystore for caching Airtable responses
- **Rationale:** Redis is purpose-built for caching with TTL, low latency (<1ms), simple key-value operations
- **Trade-off:** Requires VPC peering (Cloud Run → Memorystore), adds ~$50/month cost vs free Datastore tier

**ADR-004: Why IAP instead of custom authentication?**
- **Decision:** Use Identity-Aware Proxy for Google Workspace SSO
- **Rationale:** No custom auth logic, leverages existing Symphonic Google Workspace, zero-trust network model
- **Trade-off:** Requires Google Workspace domain, users must have Google accounts

---

## Data Model & Scoring Engine

### Symphonic Score Algorithm (0-100 Scale)

**Purpose:** Rank releases by marketing potential and prioritize resource allocation

**Formula:**
```
Total Score = Pickup History (0-25)
            + Audience Reach (0-20)
            + Social Audience (0-20)
            + Marketing Drive Quality (0-20)
            + Release Consistency (0-15)
```

**Component Breakdown:**

#### 1. Pickup History (0-25 points)
```javascript
const firstPartyCount = pickups.filter(p => p.type === "1st Party").length;
const thirdPartyCount = pickups.filter(p => p.type === "3rd Party").length;
const coverBonus = pickups.some(p => p.cover) ? 5 : 0;

const pickupScore = Math.min(25, firstPartyCount * 4 + thirdPartyCount * 2 + coverBonus);
```

**Rationale:** 1st party DSP editorial placements are 2x more valuable than 3rd party curator placements. Cover slots are premium placements worth a 5-point bonus.

---

#### 2. Audience Reach (0-20 points)
```javascript
const audienceScore = release.spotifyML > 0
  ? Math.min(20, Math.round((Math.log10(release.spotifyML) / Math.log10(6000000)) * 20))
  : 0;
```

**Rationale:** Log scale normalizes the wide range of Spotify ML values (1K to 6M+). 6M ML = max 20 points (top-tier artist).

---

#### 3. Social Audience (0-20 points)
```javascript
const weightedFollowers = 
  (release.igFollowers || 0) * 1.0 +
  (driver.tiktok || 0) * 1.2 +
  (driver.youtube || 0) * 0.8 +
  (driver.twitter || 0) * 0.5 +
  (driver.soundcloud || 0) * 0.3;

const socialScore = Math.min(20, Math.round((weightedFollowers / 4500000) * 20));
```

**Rationale:** TikTok is weighted highest (1.2x) due to viral potential. Instagram is baseline (1.0x). Older platforms like Twitter and SoundCloud are lower priority.

---

#### 4. Marketing Drive Quality (0-20 points)
```javascript
const driverPoints = Math.min(12, (driver.drivers?.length || 0) * 3);
const pressPoints = driver.confirmedPress ? 4 : 0;
const adPoints = driver.adDetails ? 4 : 0;

const driveScore = Math.min(20, driverPoints + pressPoints + adPoints);
```

**Rationale:** Each marketing driver (tour, playlist pitch, PR campaign, etc.) is worth 3 points. Confirmed press and ad campaigns are worth 4 points each (harder to secure, higher impact).

---

#### 5. Release Consistency (0-15 points)
```javascript
const consistencyScore = Math.round((driver.releaseConsistency || 0) / 100 * 15);
```

**Rationale:** Artists who release consistently (1 single every 4-6 weeks) build momentum. Score is normalized from 0-100% consistency metric.

---

### Score Color Coding

```javascript
function scoreColor(score) {
  if (score >= 80) return "#39d98a"; // Green: High priority, strong potential
  if (score >= 65) return "#00d9ff"; // Cyan: Good potential
  if (score >= 50) return "#ffb800"; // Gold: Moderate potential
  return "#ff3d7f";                  // Pink: Low priority, needs attention
}
```

---

## Security & Authentication

### User Authentication (IAP)

**Flow:**
1. User navigates to `marketing.symphonicplatform.com`
2. Cloud Load Balancer checks IAP authorization
3. If not authenticated: Redirect to Google OAuth consent screen
4. User logs in with `@symphonicdistribution.com` Google Workspace account
5. IAP validates user is in authorized domain
6. Request proxied to backend with `X-Goog-Authenticated-User-Email` header
7. Backend logs user email for audit trail

**Authorized Users:**
- All users with `@symphonicdistribution.com` email domain
- No role-based access control (RBAC) in V1 — all users see same data

**Phase 2 Consideration:**
- Implement role-based views (e.g., marketing leads only see their releases)

---

### API Security

**Airtable Token Management:**
- Token stored in **Cloud Secret Manager** (never in git, env files, or Cloud Run env vars)
- Backend fetches token at runtime: `await secretmanager.accessSecretVersion('airtable-token')`
- Automatic rotation support (update secret version, redeploy Cloud Run)

**Rate Limiting:**
- Implement per-user rate limiting: 100 requests/5 minutes
- Use Redis to track request counts per IAP user email
- Return 429 with `Retry-After` header on limit exceeded

**CORS Policy:**
- Backend API only accepts requests from `marketing.symphonicplatform.com` origin
- No public API access (IAP + CORS enforcement)

**Content Security Policy (CSP):**
```http
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://api.airtable.com;
```

---

### Data Privacy & Compliance

**PII Handling:**
- Dashboard does NOT store user data (read-only from Airtable)
- Airtable is source of truth for all artist/release data
- No GDPR/CCPA obligations beyond Airtable's compliance

**Audit Logging:**
- Log all API requests with user email, timestamp, endpoint, response status
- Retain logs for 90 days (configurable)
- Export logs to BigQuery for compliance reporting (Phase 2)

---

## Performance & Scalability

### Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Initial page load | <2 seconds | Lighthouse Performance Score >90 |
| API response time | <500ms (P95) | Cloud Monitoring latency metric |
| Airtable cache hit rate | >80% | Redis hit/miss ratio |
| Dashboard refresh time | <1 second | Client-side timer |
| Auto-refresh interval | 5 minutes | Configurable in UI |

---

### Scalability Considerations

**Current Scale:**
- **Users:** ~20-30 marketing team members
- **Releases:** ~50-100 active releases at any time
- **Pickups:** ~500-1000 total pickups in 365-day window
- **API Requests:** ~2000/day (100 users × 20 page loads/day)

**Scaling Strategies:**

1. **Frontend:** Cloud CDN caches static assets globally, no scaling issues
2. **Backend (Cloud Run):**
   - Auto-scales to 10 instances (80 requests/container = 800 concurrent requests max)
   - 2000 requests/day = ~0.02 requests/second avg (well within limits)
3. **Cache (Memorystore):**
   - 1 GB Redis handles 100K+ cached objects
   - Current data size: ~5 MB (releases + pickups + drivers)
4. **Airtable API:**
   - Free tier: 1000 API requests/month, 5 requests/second
   - With caching: ~200 API requests/month (cache misses + manual refreshes)

**Phase 2 Scaling (if >1000 users):**
- Increase Memorystore to 5 GB Standard tier (high availability)
- Increase Cloud Run max instances to 100
- Upgrade Airtable to Pro tier (100K requests/month)

---

## Cost Estimates

### Monthly Infrastructure Costs (GCP)

| Service | Configuration | Monthly Cost |
|---|---|---|
| **Cloud Storage** | 10 GB (static assets) | $0.20 |
| **Cloud CDN** | 100 GB egress/month | $8.00 |
| **Cloud Load Balancer** | HTTPS LB base + SSL cert | $18.00 |
| **Cloud Run** | 2000 requests/day, 10ms avg, 512 MB | $10.00 |
| **Cloud Memorystore (Redis)** | 1 GB Basic tier | $50.00 |
| **Cloud Build** | 10 builds/month (within free tier) | $0.00 |
| **Cloud Logging** | 10 GB logs/month (within free tier) | $0.50 |
| **Cloud Monitoring** | 2 uptime checks, 5 alerting policies | $5.00 |
| **Secret Manager** | 1 secret, 100 accesses/month | $0.06 |
| **Cloud DNS** | 1 hosted zone, 1M queries/month | $0.20 |
| **TOTAL (GCP)** | | **~$92/month** |

---

### External Service Costs

| Service | Configuration | Monthly Cost |
|---|---|---|
| **Airtable** | Free tier (1000 API requests/month) | $0.00 |
| **Airtable Pro** | (Optional upgrade for 100K requests/month) | $20.00 |
| **TOTAL (External)** | | **$0-20/month** |

---

### Total Monthly Cost: **$92-112/month**

**Cost Optimization Opportunities:**
- Use committed use discounts for Cloud Run (10-20% savings)
- Increase cache TTL to reduce Airtable API calls
- Use Cloud Storage lifecycle policies to delete old build artifacts

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-4)
**Goal:** Deploy functional dashboard with core features

**Tasks:**
- [ ] Set up GCP project and enable required APIs
- [ ] Create Cloud Storage bucket and configure Cloud CDN
- [ ] Build Node.js backend API with Airtable integration
- [ ] Deploy backend to Cloud Run with Secret Manager for token
- [ ] Set up Cloud Memorystore (Redis) and connect to Cloud Run
- [ ] Configure IAP authentication on Cloud Load Balancer
- [ ] Migrate frontend to use backend API instead of direct Airtable calls
- [ ] Implement Command Center view (FR-001)
- [ ] Implement Release Management view (FR-002)
- [ ] Implement Artist Detail Panel (FR-003)
- [ ] Set up Cloud Build CI/CD pipeline
- [ ] Deploy to production with custom domain

**Deliverables:**
- ✅ Deployed dashboard at `marketing.symphonicplatform.com`
- ✅ IAP authentication for Symphonic Google Workspace users
- ✅ Command Center, Releases, and Artist Detail views functional
- ✅ Automated deployments from GitHub

---

### Phase 2: Performance Analytics (Weeks 5-6)
**Goal:** Add historical pickup tracking and trend analysis

**Tasks:**
- [ ] Implement Performance Analytics view (FR-004)
- [ ] Build weekly pickup trend chart (14 weeks)
- [ ] Build pickups by DSP and lead charts
- [ ] Add date range selector (last 30/60/90 days)
- [ ] Optimize Airtable queries with pagination and caching

**Deliverables:**
- ✅ Performance view with historical trends
- ✅ DSP and lead performance breakdowns

---

### Phase 3: Artist Profiles & Insights (Weeks 7-8)
**Goal:** Deep-dive artist intelligence and automated insights

**Tasks:**
- [ ] Implement Artist Profile Page (FR-005)
- [ ] Build all-time pickup history timeline
- [ ] Add similar artist comparisons
- [ ] Implement Insights Engine (FR-006)
- [ ] Add dismissible alerts for missing drivers, no pickup history

**Deliverables:**
- ✅ Artist Profile Page with deep metrics
- ✅ Automated insights and alerts

---

### Phase 4: Polish & Launch (Weeks 9-12)
**Goal:** Production-ready dashboard with monitoring and documentation

**Tasks:**
- [ ] Implement auto-refresh (configurable interval)
- [ ] Add manual cache invalidation button
- [ ] Set up Cloud Monitoring uptime checks and alerts
- [ ] Implement error logging to Cloud Logging
- [ ] Write user documentation (internal wiki)
- [ ] Conduct user acceptance testing (UAT) with marketing team
- [ ] Address UAT feedback and bug fixes
- [ ] Launch announcement and training session

**Deliverables:**
- ✅ Production-ready dashboard
- ✅ User documentation
- ✅ Monitoring and alerting configured
- ✅ Team training complete

---

## Success Metrics

### Adoption Metrics
- **Target:** 90% of marketing team uses dashboard daily by Week 8
- **Measurement:** IAP authentication logs (unique users/day)

### Efficiency Metrics
- **Target:** Tuesday review meeting time reduced from 60 minutes to <30 minutes
- **Measurement:** User survey (pre/post implementation)

### Technical Metrics
- **Target:** 99.9% uptime (excluding planned maintenance)
- **Measurement:** Cloud Monitoring uptime checks

- **Target:** P95 API latency <500ms
- **Measurement:** Cloud Monitoring latency metrics

- **Target:** Airtable cache hit rate >80%
- **Measurement:** Redis hit/miss ratio logs

### User Satisfaction
- **Target:** Net Promoter Score (NPS) >50
- **Measurement:** Quarterly user survey

---

## Risk Assessment

### High-Priority Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Airtable API rate limiting** | Dashboard becomes unusable during peak usage | Medium | Implement aggressive caching (5-min TTL), upgrade to Airtable Pro if needed |
| **Inaccurate scoring algorithm** | Users lose trust in prioritization | Medium | Validate scoring logic with marketing team, iterate based on feedback |
| **IAP misconfiguration** | Unauthorized access to sensitive data | Low | Test IAP with staging environment, restrict to @symphonicdistribution.com domain only |
| **Airtable schema changes** | Dashboard breaks due to field renames | Medium | Document required fields, implement schema validation, alert on API errors |
| **Cloud Run cold starts** | Slow initial page loads (>3 seconds) | Medium | Set min instances to 1 (increases cost to ~$15/month) |

---

### Medium-Priority Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **User adoption failure** | Dashboard not used, investment wasted | Low | Involve marketing team in design process, conduct UAT, provide training |
| **Cost overruns** | Monthly costs exceed $200 | Low | Set budget alerts in GCP, monitor usage weekly, optimize cache TTL |
| **Data staleness** | Users see outdated data due to caching | Medium | Display last refresh timestamp, add manual refresh button |

---

## Open Questions

### Product Questions
1. **Q:** Should users be able to edit releases or drivers directly in the dashboard?
   - **A (Assumption):** No, dashboard is read-only. Edits happen in Airtable (source of truth).

2. **Q:** What is the expected latency for Airtable API responses?
   - **A (Assumption):** ~200-500ms per request. Caching is critical to meet <2s page load target.

3. **Q:** Should the dashboard support mobile devices (phone, tablet)?
   - **A (Assumption):** Responsive web design only (no native app). Primarily used on desktop.

4. **Q:** How should "similar artist comparisons" be calculated?
   - **A (Needs Input):** Manual curation in Airtable? Spotify API integration? Genre-based matching?

### Technical Questions
1. **Q:** Does Symphonic have an existing GCP project/organization?
   - **A (Needs Input):** If yes, use existing billing account. If no, create new GCP org.

2. **Q:** What is the custom domain for the dashboard?
   - **A (Assumption):** `marketing.symphonicplatform.com` (requires DNS configuration).

3. **Q:** Who manages Airtable base schema changes?
   - **A (Needs Input):** Dashboard team needs advance notice of field renames/deletions.

4. **Q:** Should the dashboard integrate with Monday.com or other project management tools?
   - **A (Assumption):** No integrations in V1. Future consideration for task syncing.

---

## Appendix A: Environment Variables

**Frontend (Vite):**
```bash
# .env (not committed to git)
VITE_API_BASE_URL=https://marketing-api.symphonicplatform.com
```

**Backend (Cloud Run):**
```bash
# Set via Cloud Run deployment
NODE_ENV=production
REDIS_HOST=10.0.0.3  # Cloud Memorystore IP
REDIS_PORT=6379
CACHE_TTL_SECONDS=300  # 5 minutes

# Loaded from Secret Manager (not env vars)
AIRTABLE_TOKEN=<secret>
AIRTABLE_BASE=apppQyOGTr6uGeYZd
```

---

## Appendix B: API Endpoint Specifications

### GET /api/releases

**Description:** Fetch release schedule (next 60 days + last 7 days)

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "rec123",
      "upc": "824296182201",
      "artist": "Neon Pulse",
      "release": "Static Dreams EP",
      "date": "2025-05-18",
      "genre": "Electronic",
      "subgenre": "Synthwave",
      "priority": "Priority 1",
      "lead": "Greg",
      "ei": true,
      "territory": "US",
      "override": ["Viral Moment"],
      "spotifyML": 1200000,
      "igFollowers": 284000,
      "label": "Voltage Records",
      "spReady": true,
      "apReady": true,
      "amReady": false,
      "tiReady": true
    }
  ],
  "cached": false,
  "fetchedAt": "2025-05-17T14:30:00Z"
}
```

---

### GET /api/drivers?upcs=...

**Description:** Fetch driver submissions for a comma-separated list of UPCs

**Query Parameters:**
- `upcs` (required, string): Comma-separated UPC codes (max 50)

**Response (200 OK):**
```json
{
  "data": {
    "Luna Vega": {
      "story": "Luna Vega is a rising reggaeton star...",
      "similarArtists": "Bad Bunny, Karol G, Rosalía",
      "mood": ["Energetic", "Romantic"],
      "songStyles": ["Reggaeton", "Latin Pop"],
      "drivers": ["TikTok Campaign", "Radio Push"],
      "upcomingShows": "Miami (June 1), NYC (June 15)",
      "adDetails": "Meta ads $5K budget",
      "confirmedPress": "Billboard, Rolling Stone"
    },
    "824296202201": {
      "story": "Luna Vega is a rising reggaeton star...",
      ...
    }
  },
  "cached": true,
  "fetchedAt": "2025-05-17T14:25:00Z"
}
```

---

### GET /api/pickups

**Description:** Fetch playlist pickups (last 365 days)

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "data": [
    {
      "playlist": "Today's Top Hits",
      "dsp": "Spotify",
      "release": "Amor Eterno",
      "artist": "Luna Vega",
      "type": "1st Party",
      "dateSent": "2025-05-10",
      "lead": "AJ",
      "cover": false
    }
  ],
  "cached": false,
  "fetchedAt": "2025-05-17T14:30:00Z"
}
```

---

## Appendix C: GCP Setup Commands

### Initial Setup

```bash
# Set GCP project
gcloud config set project symphonic-marketing-dashboard

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com \
  iap.googleapis.com \
  dns.googleapis.com \
  compute.googleapis.com

# Create Cloud Storage bucket for frontend
gsutil mb -l us-central1 gs://symphonic-marketing-dashboard-prod
gsutil iam ch allUsers:objectViewer gs://symphonic-marketing-dashboard-prod
gsutil web set -m index.html -e index.html gs://symphonic-marketing-dashboard-prod

# Store Airtable token in Secret Manager
echo -n "YOUR_AIRTABLE_TOKEN" | gcloud secrets create airtable-token --data-file=-

# Create Cloud Memorystore Redis instance
gcloud redis instances create marketing-dashboard-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=basic
```

---

## Appendix D: Deployment Checklist

### Pre-Deployment
- [ ] Airtable base ID and token obtained
- [ ] GCP project created with billing enabled
- [ ] Custom domain DNS configured (CNAME to LB IP)
- [ ] SSL certificate provisioned (Let's Encrypt or Google-managed)
- [ ] IAP OAuth consent screen configured (internal)

### Deployment
- [ ] Cloud Storage bucket created and configured
- [ ] Cloud Memorystore instance provisioned
- [ ] Secret Manager secrets created (Airtable token)
- [ ] Backend Docker image built and pushed to GCR
- [ ] Cloud Run service deployed with secrets
- [ ] Cloud Load Balancer configured with IAP
- [ ] Cloud CDN enabled on LB backend
- [ ] Cloud Build trigger configured (GitHub → Cloud Run)

### Post-Deployment
- [ ] Uptime checks created in Cloud Monitoring
- [ ] Alerting policies configured (latency, errors, rate limits)
- [ ] Dashboard smoke test completed (all views load)
- [ ] IAP authorization tested (only @symphonicdistribution.com allowed)
- [ ] User training session scheduled
- [ ] Documentation published to internal wiki

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-22 | Lorenzo (AI) | Initial PRD draft |

---

**END OF DOCUMENT**
