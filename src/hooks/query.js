import { useQuery } from "@tanstack/react-query";
import { queryKeys, apiEndPoint } from "./queryConstant";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import axios from "axios";
import { data } from "react-router-dom";
export const useQueryGetUserBalance = (jwt) => {
  console.log("jwt", jwt);
  const { connected, connect, select, address } = useWallet();
  const queryKey = [queryKeys.getUserBalance];

  const queryFn = async () => {
    let config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: `${apiEndPoint}/blockchain/getBalance`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      data: {
        walletAddress: address,
        blockchain: "Tron",
      },
    };

    const tx = await axios.request(config);
    console.log("txxx", tx);
    return tx?.data;
  };

  return useQuery(queryKey, queryFn, {
    refetchOnWindowFocus: true,
    // refetchInterval: 1000,
    onError: (error) => {
      // console.log(error);
    },
  });
};
export const useQueryGetUserBanks = (jwt) => {
  const { connected, connect, select, address } = useWallet();
  const queryKey = [queryKeys.getUserBalance];

  const queryFn = async () => {
    let config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: `${apiEndPoint}/user/getBankDetails`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${jwt}`,
      },
     
    };

    const tx = await axios.request(config);
    return tx?.data;
  };

  return useQuery(queryKey, queryFn, {
    refetchOnWindowFocus: true,
    // refetchInterval: 1000,
    onError: (error) => {
      // console.log(error);
    },
  });
};
