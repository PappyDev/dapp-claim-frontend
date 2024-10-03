'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TokenClaimer from '../constants/TokenClaimer.json';
import styles from './page.module.css';

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        const handleAccountsChanged = (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }

        try {
          await tempProvider.send('eth_requestAccounts', []);
          const tempSigner = tempProvider.getSigner();
          const address = await tempSigner.getAddress();
          setSigner(tempSigner);
          setAccount(address);

          const claimerContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CLAIMER_ADDRESS,
            TokenClaimer.abi,
            tempSigner
          );
          setContract(claimerContract);
        } catch (err) {
          console.error(err);
        }
      } else {
        alert('Please install MetaMask!');
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    try {
      await provider.send('eth_requestAccounts', []);
      const tempSigner = provider.getSigner();
      const address = await tempSigner.getAddress();
      setSigner(tempSigner);
      setAccount(address);

      const claimerContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CLAIMER_ADDRESS,
        TokenClaimer.abi,
        tempSigner
      );
      setContract(claimerContract);
    } catch (err) {
      console.error(err);
    }
  };

  const claimTokens = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.claim();
      await tx.wait();
      alert('Tokens claimed successfully!');
      window.location.reload(); // Reload the page
    } catch (err) {
      console.error(err);
      alert(err.reason || 'Failed to claim tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Token Claim dApp</h1>
      {!account ? (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected as: {account}</p>
          <p>You will claim 20 USDT and 20 USDC tokens.</p>
          <button
            onClick={claimTokens}
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Claiming...' : 'Claim Tokens'}
          </button>
          <p>USDT Address: ({usdtAddress})</p>
          <p>USDC Address: ({usdcAddress})</p>
        </div>
      )}
    </div>
  );
}