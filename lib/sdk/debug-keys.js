const { createTfheKeypair } = require("fhevmjs");
async function test() {
  const { publicKey, crs } = createTfheKeypair();
  console.log("PublicKey:", publicKey);
  console.log("CRS:", crs);
  console.log("CRS keys:", Object.keys(crs));
  console.log("CRS proto:", Object.getPrototypeOf(crs));
}
test();
