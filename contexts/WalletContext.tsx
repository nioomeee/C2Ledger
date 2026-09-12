'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return (
      typeof window !== 'undefined' &&
      window.ethereum &&
      window.ethereum.isMetaMask
    );
  };

  // Get the provider
  const getProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError(
        'MetaMask is not installed. Please install MetaMask to continue.'
      );
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const provider = getProvider();
      if (!provider) {
        throw new Error('Failed to get provider');
      }

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];

      if (!account) {
        throw new Error('No accounts found');
      }

      // Get network details
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Check if we're on the correct network (Hardhat local network)
      if (chainId !== 31337) {
        console.log(`Current chain ID: ${chainId}, switching to 31337...`);
        await switchNetwork();
        // After switching, we need to reconnect to get the new network
        setTimeout(() => {
          connectWallet();
        }, 1000);
        return;
      }

      // Get signer
      const signer = await provider.getSigner();

      // Update state
      setAccount(account);
      setChainId(chainId);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);

      // Store connection in localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAccount', account);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAccount');
  };

  // Switch to Hardhat network
  const switchNetwork = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      // First try to switch to the existing network if it exists
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }], // 31337 in hex
        });
        return; // If successful, we're done
      } catch (switchError: any) {
        // If the network doesn't exist, we'll add it
        if (switchError.code === 4902) {
          console.log('Network not found, adding new network...');
        } else {
          throw switchError;
        }
      }

      // Add the Hardhat network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x7A69', // 31337 in hex
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['http://127.0.0.1:8545'],
            blockExplorerUrls: [],
          },
        ],
      });
    } catch (err) {
      console.error('Error switching network:', err);
      setError(
        "Failed to switch to Hardhat network. Please check MetaMask and ensure you're on the correct network (Chain ID: 31337)."
      );
    }
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        localStorage.setItem('walletAccount', accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      const savedAccount = localStorage.getItem('walletAccount');

      if (wasConnected && savedAccount && isMetaMaskInstalled()) {
        try {
          const provider = getProvider();
          if (provider) {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0 && accounts[0].address === savedAccount) {
              const network = await provider.getNetwork();
              const chainId = Number(network.chainId);

              if (chainId === 31337) {
                const signer = await provider.getSigner();
                setAccount(savedAccount);
                setChainId(chainId);
                setProvider(provider);
                setSigner(signer);
                setIsConnected(true);
              }
            }
          }
        } catch (err) {
          console.error('Error checking existing connection:', err);
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAccount');
        }
      }
    };

    checkExistingConnection();
  }, []);

  const value: WalletContextType = {
    account,
    isConnected,
    isConnecting,
    chainId,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    error,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
