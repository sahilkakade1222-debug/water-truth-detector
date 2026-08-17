# Water Watch

Build a modern, production-grade cybersecurity and environmental audit dashboard called "STP-Tracker: Sewage Treatment Verifier". The goal of the app is to detect falsified municipal water treatment records by cross-referencing smart meter energy consumption (kWh) against reported water purification output (MLD - Millions of Liters per Day).

Design Requirements:

- Theme: Ultra-dark mode (similar to GitHub Dark / Vercel dark theme). Primary colors: Deep dark grey (#0E1117, #161B22), Cyan/Blue for baseline lines, Emerald Green for verified points (#00CC96), Bright Neon Red (#FF2A6D) for flagged anomalies.

- Font & Vibe: Clean, technical, enterprise-ready, scannable for judges.

Layout Breakdown:

1. Top Header:

   - App title: "💧 STP-Tracker | Nag River Sewage Treatment Verifier"

   - Subtitle: "Real-time anomaly detection matching energy draw against reported NMC purification logs."

2. Sidebar (Interactive Simulation Controls):

   - Form controls for live judge testing:

     - Number Input: "Reported Water Output (MLD)" (Default: 12.0)

     - Number Input: "Measured Energy Draw (kWh)" (Default: 800)

     - Submit Button: "Inject Log Entry"

   - Two Quick Preset Buttons: "Simulate Normal Operation" (adds 10 MLD / 1900 kWh) and "Simulate Falsification Fraud" (adds 15 MLD / 400 kWh).

3. Main Panel - Metrics Summary Cards (Row of 4):

   - Metric 1: Latest Water Output (MLD)

   - Metric 2: Latest Energy Consumed (kWh)

   - Metric 3: Specific Power Efficiency (kWh / MLD)

   - Metric 4: System Status Badge (Displays green "✅ VERIFIED OPERATIONAL" or glowing red "⚠️ FALSIFICATION DETECTED").

4. Main Panel - Interactive Chart:

   - A line chart showing Energy Consumption (kWh) vs Time.

   - Plot normal data points as clean green markers on the line.

   - Highlight any flagged anomaly data points as prominent, glowing red "X" markers on the graph.

   - Hover tooltips showing exact timestamp, reported MLD, and measured kWh.

5. Bottom Section - Verification Log Table:

   - Interactive table showing past logs: Timestamp, Reported MLD, Energy kWh, kWh/MLD Ratio, and Status (PASS / ANOMALY FLAG).

   - Highlight anomaly rows with a subtle red background tint.

Logic to Bake In:

- Flag an entry as an anomaly if the ratio (kWh / MLD) falls below 120 (meaning high water reported with suspiciously low power used). Populate 10 historical data points on load, including at least 1 visual anomaly.

-

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f21d7f63-a6f3-4928-89f5-e1f9151ed485).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
