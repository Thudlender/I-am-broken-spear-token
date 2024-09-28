"use client";
import React, { useState, useEffect } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  Card,
  CardContent,
  TextField,
  Box,
  IconButton,
  Divider,
} from "@mui/material";

import abi from "./abi.json";
import MenuIcon from "@mui/icons-material/Menu";

import { ethers } from "ethers";
import { formatEther, parseUnits } from "@ethersproject/units";

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useAccounts, useIsActive, useProvider } =
  hooks;
const contractChain = 11155111;
const contractAddress = "0x8544426Bb8d47C1884eB326a328A854C79ADBF4d"; //address of smart contract

const getAddressTxt = (str: string, s = 6, e = 6) => {
  if (str) {
    return `${str.slice(0, s)}...${str.slice(str.length - e)}`;
  }
  return "";
};

export default function Page() {
  // const chainId = useChainId();
  const accounts: any = useAccounts();
  const isActive: any = useIsActive();

  const provider: any = useProvider();
  // const [error, setError] = useState(undefined);

  const [balance, setBalance] = useState("");
  useEffect(() => {
    const fetchBalance = async () => {
      const signer: any = provider?.getSigner();
      // ประกาศ object smartContract ที่ new มาจากคลาส Contract ซึ่งมีพารามิเตอร์ ที่อยู่ contract, ข้อมูล abi, ตัวแปร signer
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const myBalance = await smartContract.balanceOf(accounts[0]);
      console.log(formatEther(myBalance));
      setBalance(formatEther(myBalance));
    };
    if (isActive) {
      fetchBalance();
    }
  }, [isActive]);

  const [ETHValue, setETHValue] = useState(0);
  const handleBuy = async () => {
    if (ETHValue <= 0) {
      return;
    }

    const signer = provider?.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, signer);
    const weiValue = parseUnits(ETHValue.toString(), "ether");
    const tx = await smartContract.buy({
      value: weiValue.toString(),
    });
    console.log("Transaction hash:", tx.hash);
  };

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
    alert(
      "To fully disconnect, please remove this site from MetaMask's connected sites by locking metamask."
    );
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              I am broken spear Token CryptoExchange
            </Typography>

            {!isActive ? (
              <Button variant="contained" onClick={handleConnect}>
                Connect
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Chip label={getAddressTxt(accounts[0])} variant="outlined" />

                <Button
                  variant="contained"
                  color="inherit"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </Stack>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {isActive ? (
          <>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography>SLL</Typography>
                  <TextField label="Address" value={contractAddress} />
                  <TextField label="SLL Balance" value={balance} />
                  <Divider />
                  <Typography>Buy SLL (1 ETH = 10 UDS)</Typography>
                  <TextField
                    label="ETH"
                    type="number"
                    onChange={(e: any) => setETHValue(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleBuy}>
                    Buy
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Container>
    </div>
  );
}
