# Patch Review Board Dashboard 🚀

A modern, Mission-Control-style Next.js web dashboard designed to track, review, and finalize operating system patches analyzed by the OpenClaw AI agent.

## Features Developed (2026-02-27 Roadmap)
- **Live Fractional Progress KPI:** Aggregates and displays real-time fraction metrics across the OS taxonomy (`Products Reviewed` out of total products).
- **Manager Review Flow:** Allows patch managers to view raw AI feedback, exclude irrelevant patches with contextual AI learning prompts, and officially click `[Mark Product Review as DONE]`.
- **Intelligent CSV Exporting:** Consolidates all accepted patches into a highly detailed output CSV retaining original OS metrics, ready to be deployed.
- **Glassmorphism UI:** Features premium translucent cards, dynamic progress bars, and high contrast typography tailored for SOC analysts.

## Setup
```bash
cd patch-review-dashboard
npm install
npm run dev
```
