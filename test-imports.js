/**
 * Test script to identify problematic module imports
 */

console.log('Starting import tests...');

try {
  console.log('Testing dotenv import...');
  const dotenv = require('dotenv');
  console.log('✅ dotenv imported successfully');
} catch (error) {
  console.error(`❌ dotenv import failed: ${error.message}`);
}

try {
  console.log('Testing xrpl import...');
  const xrpl = require('xrpl');
  console.log('✅ xrpl imported successfully');
} catch (error) {
  console.error(`❌ xrpl import failed: ${error.message}`);
}

try {
  console.log('Testing ws import...');
  const WebSocket = require('ws');
  console.log('✅ ws imported successfully');
} catch (error) {
  console.error(`❌ ws import failed: ${error.message}`);
}

try {
  console.log('Testing axios import...');
  const axios = require('axios');
  console.log('✅ axios imported successfully');
} catch (error) {
  console.error(`❌ axios import failed: ${error.message}`);
}

try {
  console.log('Testing uuid import...');
  const { v4: uuidv4 } = require('uuid');
  console.log('✅ uuid imported successfully');
} catch (error) {
  console.error(`❌ uuid import failed: ${error.message}`);
}

try {
  console.log('Testing express import...');
  const express = require('express');
  console.log('✅ express imported successfully');
} catch (error) {
  console.error(`❌ express import failed: ${error.message}`);
}

try {
  console.log('Testing cors import...');
  const cors = require('cors');
  console.log('✅ cors imported successfully');
} catch (error) {
  console.error(`❌ cors import failed: ${error.message}`);
}

console.log('Import tests completed.');
