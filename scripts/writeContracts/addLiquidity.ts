import { ethers, network } from "hardhat";
import {
  UNISWAPv2_CONTRACT_ADDRESS,
  USDC_UNI_HOLDER,
  ADDRESS_TO,
  UNI_ADDRESS,
  USDC_ADDRESS,
  USDC_HOLDER,
} from "../contractAddress/address";

async function main() {
  const uniSwapContract = await ethers.getContractAt(
    "IUniswap",
    UNISWAPv2_CONTRACT_ADDRESS
  );

  const uniContract = await ethers.getContractAt("ITokenAB", UNI_ADDRESS);
  const usdcContract = await ethers.getContractAt("ITokenAB", USDC_ADDRESS);

  // Impersonate signers
  const uniUsdcSigner = await ethers.getImpersonatedSigner(USDC_UNI_HOLDER);
  const usdcOwner = await ethers.getImpersonatedSigner(USDC_HOLDER);

  const amountADesired = ethers.parseEther("1");
  const amountBDesired = ethers.parseEther("1");
  const amountAmin = 0;
  const amountBmin = 0;
  const addressTo = ADDRESS_TO;
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const deadline = currentTimestampInSeconds + 86400;

  const uniUsdcAllowance = ethers.parseEther("10");

  // Approvals
  //   await usdcContract
  //     .connect(uniUsdcSigner)
  //     .approve(uniSwapContract, uniUsdcAllowance);
  //   await uniContract
  //     .connect(uniUsdcSigner)
  //     .approve(uniSwapContract, uniUsdcAllowance);

  // check allowance
  const allowanceUSDC = await usdcContract.allowance(
    uniUsdcSigner,
    uniSwapContract
  );
  const allowanceUNI = await uniContract.allowance(
    uniUsdcSigner,
    uniSwapContract
  );

  console.log({
    allowanceUNI: ethers.formatEther(allowanceUNI),
    allowanceUSDC: ethers.formatEther(allowanceUSDC),
  });

  // Balance Before adding Liquidity

  const beforeBalanceUNI = await uniContract.balanceOf(uniUsdcSigner);
  const beforeBalanceUSDC = await usdcContract.balanceOf(uniUsdcSigner);

  const balUSDC = await usdcContract.balanceOf(usdcOwner);
  console.log({
    beforeBalanceUNI: ethers.formatEther(beforeBalanceUNI),
    beforeBalanceUSDC: ethers.formatEther(beforeBalanceUSDC),
    balUSDC: ethers.formatEther(balUSDC),
  });

  await network.provider.send("hardhat_setBalance", [
    "0x9ec13d76224d5111b630a7ee71df84625e5dbb65",
    "0xDE0B6B3A7640000",
  ]);

  //   const usdcAmount = 8750000000000;

  //   await usdcContract.connect(usdcOwner).transfer(uniUsdcSigner, usdcAmount);

  const txReceipt = await uniSwapContract
    .connect(uniUsdcSigner)
    .addLiquidity(
      UNI_ADDRESS,
      USDC_ADDRESS,
      amountADesired,
      amountBDesired,
      amountAmin,
      amountBmin,
      uniUsdcSigner,
      deadline
    );

  await txReceipt.wait();

  // Balance After

  const afterBalanceUNI = await uniContract.balanceOf(uniUsdcSigner);
  const afterBalanceUSDC = await usdcContract.balanceOf(uniUsdcSigner);
  const afterbalUSDC = await usdcContract.balanceOf(usdcOwner);
  console.log({
    afterBalanceUNI: ethers.formatEther(afterBalanceUNI),
    afterBalanceUSDC: ethers.formatEther(afterBalanceUSDC),
    afterbalUSDC: ethers.formatEther(afterbalUSDC),
  });

  // Getting the Pair Balance After Adding Liquidity

  const factory = await uniSwapContract.factory();

  const factoryContract = await ethers.getContractAt("IUniswap", factory);

  const getPair = await factoryContract.getPair(UNI_ADDRESS, USDC_ADDRESS);

  const getPairContract = await ethers.getContractAt("IUniswap", getPair);

  const liquidityPairBalance = await getPairContract.balanceOf(uniUsdcSigner);

  console.log({
    LiquidityPairBalance: ethers.formatEther(liquidityPairBalance),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
