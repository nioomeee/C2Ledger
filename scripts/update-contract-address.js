const fs = require('fs');
const path = require('path');

// Usage: node scripts/update-contract-address.js <new-contract-address>
const newAddress = process.argv[2];

if (!newAddress) {
  console.error('❌ Please provide a contract address');
  console.log(
    'Usage: node scripts/update-contract-address.js <contract-address>'
  );
  process.exit(1);
}

if (!newAddress.startsWith('0x') || newAddress.length !== 42) {
  console.error('❌ Invalid contract address format');
  console.log(
    'Address should be a valid Ethereum address (0x followed by 40 hex characters)'
  );
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'lib', 'config.ts');

try {
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace the contract address in the config file
  configContent = configContent.replace(
    /CONTRACT_ADDRESS: '[^']*'/,
    `CONTRACT_ADDRESS: '${newAddress}'`
  );

  fs.writeFileSync(configPath, configContent);
  console.log(
    `✅ Updated config file with new contract address: ${newAddress}`
  );
  console.log(
    '🔄 Please restart your development server to pick up the changes'
  );
} catch (error) {
  console.error('❌ Failed to update config file:', error.message);
  process.exit(1);
}
