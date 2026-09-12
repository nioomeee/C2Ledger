// Contract Configuration
export const CONFIG = {
  // Contract address - update this after each deployment
  CONTRACT_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',

  // Network Configuration
  CHAIN_ID: 31337,
  NETWORK_NAME: 'Hardhat Local',
  RPC_URL: 'http://127.0.0.1:8545',

  // Test Accounts
  GOVERNANCE_ACCOUNTS: [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  ] as string[],

  // Certifier Accounts
  CERTIFIER_ACCOUNTS: [
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  ] as string[],

  // Producer Accounts
  PRODUCER_ACCOUNTS: [
    '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Your Producer Account
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  ] as string[],
} as const;

// Helper function to get contract address
export function getContractAddress(): string {
  return CONFIG.CONTRACT_ADDRESS;
}

// Helper function to check if address is governance
export function isGovernanceAccount(address: string): boolean {
  return CONFIG.GOVERNANCE_ACCOUNTS.includes(address);
}

// Helper function to check if address is certifier
export function isCertifierAccount(address: string): boolean {
  return CONFIG.CERTIFIER_ACCOUNTS.includes(address);
}

// Helper function to check if address is producer
export function isProducerAccount(address: string): boolean {
  return CONFIG.PRODUCER_ACCOUNTS.includes(address);
}
