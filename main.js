if (typeof process === "undefined") {
  window.process = { env: { NODE_ENV: "development" } };
}

import { WalletConnectModalSign } from "https://unpkg.com/@walletconnect/modal-sign-html@2.6.1";

// 1. Define ui elements
const connectButtonMainnet = document.getElementById("connect-button-mainnet");
const connectButtonTestnet = document.getElementById("connect-button-testnet");
const getWalletsButton = document.getElementById("get-wallets-button");
const signMessageButton = document.getElementById("sign-message-button");

// 2. Create modal client, add your project id
const web3Modal = new WalletConnectModalSign({
  projectId: "d6ab8e89e32e2aa34530bee99d2d5e3c",
  metadata: {
    name: "Chia Walletconnect JS Example",
    description: "My Dapp description",
    url: "https://greimela.github.io/chia-walletconnect-js-example/",
    icons: ["https://my-dapp.com/logo.png"],
  },
});

let session = undefined;
web3Modal.getSessions().then((sessions) => {
  console.log({ sessions });
  if (sessions.length > 0) {
    session = sessions[0];
    connectButtonMainnet.disabled = true;
    connectButtonTestnet.disabled = true;
    getWalletsButton.disabled = false;
    signMessageButton.disabled = false;
  } else {
    getWalletsButton.disabled = true;
    signMessageButton.disabled = true;
  }
});

async function onConnectMainnet() {
  try {
    connectButtonMainnet.disabled = true;
    session = await web3Modal.connect({
      requiredNamespaces: {
        chia: {
          methods: ["chia_getWallets", "chia_signMessageById"],
          chains: ["chia:mainnet"],
          events: [],
        },
      },
    });
    if (session) {
      getWalletsButton.disabled = false;
      signMessageButton.disabled = false;
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (!session) {
      connectButtonMainnet.disabled = false;
    } else {
      connectButtonTestnet.disabled = true;
    }
  }
}

async function onConnectTestnet() {
  try {
    connectButtonTestnet.disabled = true;
    session = await web3Modal.connect({
      requiredNamespaces: {
        chia: {
          methods: ["chia_getWallets", "chia_signMessageById"],
          chains: ["chia:testnet"],
          events: [],
        },
      },
    });
    if (session) {
      getWalletsButton.disabled = false;
      signMessageButton.disabled = false;
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (!session) {
      connectButtonTestnet.disabled = false;
    } else {
      connectButtonMainnet.disabled = true;
    }
  }
}

async function getWallets() {
  try {
    getWalletsButton.disabled = true;
    getWalletsButton.innerHTML = "Waiting for wallet confirmation...";
    const accountSplit = session.namespaces.chia.accounts[0].split(":");
    const chainId = accountSplit[0] + ":" + accountSplit[1];
    const fingerprint = accountSplit[2];
    const result = await web3Modal.request({
      topic: session.topic,
      chainId,
      request: {
        method: "chia_getWallets",
        params: {
          fingerprint,
          includeData: true,
        },
      },
    });
    console.log({ result });
    document.getElementById("wallets").innerHTML = result.data
      .map((wallet) => `<li>${wallet.name}</li>`)
      .join("");
  } catch (err) {
    console.error(err);
  } finally {
    getWalletsButton.disabled = false;
    getWalletsButton.textContent = "Get Wallets";
  }
}

async function signMessage() {
  try {
    signMessageButton.disabled = true;
    signMessageButton.innerHTML = "Waiting for wallet confirmation...";
    const accountSplit = session.namespaces.chia.accounts[0].split(":");
    const chainId = accountSplit[0] + ":" + accountSplit[1];
    const fingerprint = accountSplit[2];
    const result = await web3Modal.request({
      topic: session.topic,
      chainId,
      request: {
        method: "chia_signMessageById",
        params: {
          fingerprint,
          id: document.getElementById("did-input").value,
          message: "Test message",
        },
      },
    });
    console.log({ result });
    document.getElementById("sign-result").innerHTML = JSON.stringify(
      result,
      null,
      2
    );
  } catch (err) {
    console.error(err);
  } finally {
    signMessageButton.disabled = false;
    signMessageButton.textContent = "Sign message by ID";
  }
}

// 4. Create connection handler
connectButtonMainnet.addEventListener("click", onConnectMainnet);
connectButtonTestnet.addEventListener("click", onConnectTestnet);
getWalletsButton.addEventListener("click", getWallets);
signMessageButton.addEventListener("click", signMessage);
