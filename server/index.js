const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "021f494a19772de42f49860b8400515f1089aad0f51a98f5b61fd622ca2d8bf63b": 100,
  "02b12d5237e4731e3253c6323af58c8050a9dfc5a5a0fddcc6d52d09982202d099": 50,
  "0252f43443742adfbd0c244a4541518beb1958f6f13b4e127cfd63bed28a25eca1": 75,
};
// Corresponding private keys :
// private key d91c9a253825cfc22a69337a40459976a640a64b2b98a3a946f0034705b0d5d0
// private key 464a312ae209de27d8d3e74152c002d95155ee31780ebf1f43569a56e54cd9f9
// private key 91c36762b49f92d909246d6d5265361e07b99736fb52921dbd863a1b0fa40e2b

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature} = req.body;

  if(!signature) res.status(404).send({ message: "No signature provided" });

  try {
    const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
    const hash = keccak256(bytes);

    const sig = new secp.secp256k1.Signature(BigInt(signature.r), BigInt(signature.s), signature.recovery);

    const isValidSignature = secp.secp256k1.verify(sig, hash, sender)

    if(!isValidSignature) {
      res.status(400).send({ message: "Invalid signature" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.log(error.message)
  }
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
