import { ethers } from "hardhat";
import {
  UNISWAPv2_CONTRACT_ADDRESS,
  USDC_UNI_HOLDER,
  ADDRESS_TO,
  UNI_ADDRESS,
  USDC_ADDRESS,
  USDC_HOLDER,
} from "../contractAddress/address";

async function main() {
  // getting contract
  const uniSwapContract = await ethers.getContractAt(
    "IUniswap",
    UNISWAPv2_CONTRACT_ADDRESS
  );
  const uniContract = await ethers.getContractAt("ITokenAB", UNI_ADDRESS);
  const usdcContract = await ethers.getContractAt("ITokenAB", USDC_ADDRESS);

  const uniUsdcSigner = await ethers.getImpersonatedSigner(USDC_UNI_HOLDER);

  // Getting the Pair Balance After Adding Liquidity

  const factory = await uniSwapContract.factory();

  const factoryContract = await ethers.getContractAt("IUniswap", factory);

  const getPair = await factoryContract.getPair(UNI_ADDRESS, USDC_ADDRESS);

  const getPairContract = await ethers.getContractAt("IUniswap", getPair);

  const liquidityPairBalance = await getPairContract.balanceOf(uniUsdcSigner);

  console.log({
    "Liquidity Pair Balance Before": ethers.formatEther(liquidityPairBalance),
  });

  const liquidity = liquidityPairBalance;
  const amountAmin = 0;
  const amountBmin = 0;
  const addressTo = ADDRESS_TO;
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const deadline = currentTimestampInSeconds + 86400;

  /**
     * address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
     */

  const txReceipt = await uniSwapContract.removeLiquidity(
    UNI_ADDRESS,
    USDC_ADDRESS,
    liquidity,
    amountAmin,
    amountBmin,
    uniUsdcSigner,
    deadline
  );

  await txReceipt.wait();

  const afterLiquidityPairBalance = await getPairContract.balanceOf(
    uniUsdcSigner
  );

  console.log({
    " After Liquidity Pair Balance ": ethers.formatEther(
      afterLiquidityPairBalance
    ),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
