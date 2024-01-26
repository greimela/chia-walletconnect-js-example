if (typeof process === "undefined") {
  window.process = { env: { NODE_ENV: "development" } };
}

import { WalletConnectModalSign } from "https://unpkg.com/@walletconnect/modal-sign-html@2.6.1";

// 1. Define ui elements
const connectButton = document.getElementById("connect-button");
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
    connectButton.disabled = true;
    getWalletsButton.disabled = false;
    signMessageButton.disabled = false;
  } else {
    getWalletsButton.disabled = true;
    signMessageButton.disabled = true;
  }
});
// 3. Connect
async function onConnect() {
  try {
    connectButton.disabled = true;
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
      connectButton.disabled = false;
    }
  }
}

async function getWallets() {
  try {
    getWalletsButton.disabled = true;
    getWalletsButton.innerHTML = "Waiting for wallet confirmation...";
    const fingerprints = session.namespaces.chia.accounts.map((account) =>
      account.replace("chia:mainnet:", "")
    );
    const result = await web3Modal.request({
      topic: session.topic,
      chainId: "chia:mainnet",
      request: {
        method: "chia_getWallets",
        params: {
          fingerprint: fingerprints[0],
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
    const fingerprints = session.namespaces.chia.accounts.map((account) =>
      account.replace("chia:mainnet:", "")
    );
    const result = await web3Modal.request({
      topic: session.topic,
      chainId: "chia:mainnet",
      request: {
        method: "chia_signMessageById",
        params: {
          fingerprint: fingerprints[0],
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
connectButton.addEventListener("click", onConnect);
getWalletsButton.addEventListener("click", getWallets);
signMessageButton.addEventListener("click", signMessage);
