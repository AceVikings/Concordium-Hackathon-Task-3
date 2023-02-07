import React, { useState, useEffect } from "react";
import { detectConcordiumProvider } from "@concordium/browser-wallet-api-helpers";
import {
  AccountTransactionType,
  CcdAmount,
  deserializeReceiveReturnValue,
  toBuffer,
  SchemaVersion,
} from "@concordium/web-sdk";
const Body = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [currentGreeting, setCurrentGreeting] = useState("");
  /* global BigInt */

  let rawModuleSchema =
    "//8DAQAAAA8AAABoYWNrYXRob25fdGFzazIBABQAAQAAAAsAAABkZXNjcmlwdGlvbhYCAgAAAAwAAABzZXRfZ3JlZXRpbmcEFgIVAgAAABAAAABQYXJzZVBhcmFtc0Vycm9yAg4AAABDb250cmFjdFNldHRlcgIEAAAAdmlldwEUAAEAAAALAAAAZGVzY3JpcHRpb24WAgA";

  useEffect(() => {
    if (provider) getData();
  }, [provider]);

  const getData = () => {
    provider
      .getJsonRpcClient()
      .invokeContract({
        contract: { index: BigInt(2792), subindex: BigInt(0) },
        method: "hackathon_task2.view",
      })
      .then((viewResult) => {
        let returnValue = deserializeReceiveReturnValue(
          toBuffer(viewResult.returnValue, "hex"),
          toBuffer(rawModuleSchema, "base64"),
          "hackathon_task2",
          "view",
          SchemaVersion.V2
        );
        setCurrentGreeting(returnValue.description);
      });
  };
  const setWallet = () => {
    detectConcordiumProvider()
      .then((provider) => {
        setProvider(provider);

        // The API is ready for use.
        provider
          .connect()
          .then((accountAddress) => {
            // The wallet is connected to the dApp.
            setAddress(accountAddress);
          })
          .catch(() =>
            console.log(
              "Connection to the Concordium browser wallet was rejected."
            )
          );
      })
      .catch(() =>
        console.log("Connection to the Concordium browser wallet timed out.")
      );
  };

  const handleInput = (e) => {
    setGreeting(e);
    console.log(greeting);
  };

  const updateGreeting = () => {
    console.log(provider);
    console.log(address);
    provider
      .sendTransaction(
        address,
        AccountTransactionType.Update,
        {
          amount: new CcdAmount(0n),
          contractAddress: {
            index: BigInt(2792),
            subindex: 0n,
          },
          receiveName: "hackathon_task2.set_greeting",
          maxContractExecutionEnergy: 3000n,
        },
        greeting,
        rawModuleSchema
      )
      .then((msg) => {
        alert(`Successfully updated Greeting with hash: ${msg}`);
      })
      .catch(alert);
  };
  if (!address) {
    return (
      <div className="box-container">
        <p>
          This is a simple Greetings Setter Dapp, connect with Concordium Web
          Wallet to try
        </p>
        <button onClick={setWallet}>Connect Wallet</button>
      </div>
    );
  } else {
    return (
      <div className="box-container">
        <p>Wallet Connected!</p>
        <p>{"Welcome : " + address}</p>
        <p>Current Greeting:</p>
        <p>{currentGreeting}</p>
        <button onClick={getData}>Refresh</button>
        <p>Set Greeting</p>
        <input
          onBlur={(e) => {
            handleInput(e.target.value);
          }}
        ></input>
        <button onClick={updateGreeting}>Submit Greeting</button>
      </div>
    );
  }
};

export default Body;
