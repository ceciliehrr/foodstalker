#!/usr/bin/env node
// Debug script: logs raw Vinmonopolet API response to see field names and category values

import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VINMONOPOLET_API_KEY;

if (!API_KEY) {
  console.error("❌ VINMONOPOLET_API_KEY ikke satt i .env");
  process.exit(1);
}

async function tryUrl(label, url, params = {}) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  console.log(`\n=== ${label} ===`);
  console.log("URL:", u.toString());
  const r = await fetch(u.toString(), {
    headers: { "Ocp-Apim-Subscription-Key": API_KEY, "Accept": "application/json" },
  });
  console.log("Status:", r.status);
  const text = await r.text();
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      console.log(`Array med ${data.length} elementer, første 2:`);
      console.log(JSON.stringify(data.slice(0, 2), null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch {
    console.log("Rå svar:", text.slice(0, 500));
  }
}

const BASE = "https://apis.vinmonopolet.no/products/v0/details-normal";

// Test 1: Kjent vin med productId
await tryUrl("Test 1: Kjent vin (ID 11077001)", BASE, { productId: "11077001" });

// Test 2: High start offset (skip accessories which have low IDs)
await tryUrl("Test 2: start=5000, maxResults=3", BASE, { maxResults: "3", start: "5000" });

// Test 3: OData-style filter
await tryUrl("Test 3: OData $filter", BASE + "?$filter=basic/mainCategory/code eq 'Rødvin'&maxResults=3");

// Test 4: changedProducts endpoint
await tryUrl("Test 4: changed-products endpoint", "https://apis.vinmonopolet.no/products/v0/details-normal", { maxResults: "3", start: "10000" });
