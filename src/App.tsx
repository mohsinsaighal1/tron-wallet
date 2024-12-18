import React, { useEffect, useMemo, useState } from "react";
import type {
  AdapterName,
  WalletError,
} from "@tronweb3/tronwallet-abstract-adapter";
import {
  WalletDisconnectedError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";
import TextField from "@mui/material/TextField";
import TokenAbi from "../src/contracts/tokenAbi.json";

import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";
import {
  WalletActionButton,
  WalletConnectButton,
  WalletDisconnectButton,
  WalletModalProvider,
} from "@tronweb3/tronwallet-adapter-react-ui";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import TokenAddress from "../src/contracts/tokenAddress.json";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Box, Stack } from "@mui/material";
import { Button } from "@tronweb3/tronwallet-adapter-react-ui";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import OutlinedCard from "./card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Buffer } from "buffer";
window.Buffer = Buffer;

const rows = [
  { name: "Connect Button", reactUI: WalletConnectButton },
  { name: "Disconnect Button", reactUI: WalletDisconnectButton },
];
const queryClient = new QueryClient();

/**
 * wrap your app content with WalletProvider and WalletModalProvider
 * WalletProvider provide some useful properties and methods
 * WalletModalProvider provide a Modal in which you can select wallet you want use.
 *
 * Also you can provide a onError callback to process any error such as ConnectionError
 */

export function App() {
  function onError(e: WalletError) {
    if (e instanceof WalletNotFoundError) {
      toast.error(e.message);
    } else if (e instanceof WalletDisconnectedError) {
      toast.error(e.message);
    } else toast.error(e.message);
  }

  const adapters = useMemo(() => {
    const tronLinkAdapter = new TronLinkAdapter();
    return [tronLinkAdapter];
  }, []);

  return (
    <WalletProvider
      onError={onError}
      disableAutoConnectOnLoad={true}
      adapters={adapters}
    >
      <WalletModalProvider>
        <QueryClientProvider client={queryClient}>
          {/* Ensure QueryClientProvider wraps all React Query components */}
          <Profile />
        </QueryClientProvider>
      </WalletModalProvider>
    </WalletProvider>
  );
}

function Profile() {
  const { connected, connect, select } = useWallet();
  const [age, setAge] = React.useState("");
  const [currency, setCurrency] = useState("");

  console.log("connected", connected);

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  useEffect(() => {
    const autoSelectWallet = async () => {
      try {
        select("TronLink" as AdapterName); // Ensure TronLink is selected
        console.log("TronLink wallet selected automatically.");
      } catch (error) {
        console.error("Error selecting TronLink wallet:", error);
      }
    };

    autoSelectWallet(); // Call the function on component mount
  }, [select]);

  const onConnect = async () => {
    try {
      // Select the TronLink wallet
      select("TronLink" as AdapterName);

      // Wait for the wallet to connect
      await connect();

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const selectCurrency = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as string);
  };
  const sellToken = async () => {
    const tronWeb = window.tronWeb;

    try {
      if (!tronWeb || !tronWeb.defaultAddress.base58) {
        throw new Error(
          "Wallet is not connected or tronWeb is not initialized."
        );
      }
      console.log(currency);

      const currencyAddress =
        currency === "USDT" ? TokenAddress.usdt : TokenAddress.usdc;

      console.log("Currency Address:", currencyAddress);
      const contractInstance = await tronWeb.contract(
        TokenAbi,
        currencyAddress
      );

      const amountInSun = tronWeb.toSun(1); // Convert to SUN (smallest TRON unit)
      const result = await contractInstance.methods
        .transfer("TVUr3PGJoCUzMCe7LVpRR3P1jMJjYfwP1J", amountInSun)
        .send({ from: tronWeb.defaultAddress.base58 }); // Explicit sender address

      console.log("Transaction Result:", result);
    } catch (error) {
      toast(error);
      console.error("Error selling token:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Ensures the container takes full viewport height
        width: "100vw", // Ensures the container takes full viewport width
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
        <OutlinedCard />
      </Box>

      <Stack sx={{ minWidth: 400, rowGap: 2, mt: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <TextField
            fullWidth
            id="outlined-basic"
            label="Amount"
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Select Currency
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={age}
              label=""
              onChange={handleChange}
            >
              <MenuItem value={10}>USDT</MenuItem>
              <MenuItem value={20}>USDC</MenuItem>
              <MenuItem value={30}>FDUSD</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select Bank</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              label=""
              onChange={selectCurrency}
            >
              <MenuItem value={"USDT"}>USDT</MenuItem>
              <MenuItem value={"USDC"}>USDC</MenuItem>
              <MenuItem value={"FDUSD"}>FDUSD</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button
          style={{ justifyContent: "center" }}
          disabled={!connected}
          onClick={sellToken}
        >
          Sell Now
        </Button>
        {!connected ? (
          <Button
            style={{ textAlign: "center", justifyContent: "center" }}
            onClick={onConnect}
          >
            Connect Wallet
          </Button>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WalletActionButton />
          </div>
        )}
      </Stack>
    </div>
  );
}
