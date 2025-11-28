import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import MyToken from "../ignition/modules/MyToken";

describe("TinyBank", () => {
    let signers: HardhatEthersSigner[];
    let myTokenC: MyToken;
    let tinyBankC: TinyBank;
    beforeEach(async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", ["MyToken", "MT", DECIMALS, MINTING_AMOUNT]);
        tinyBankC = await hre.ethers.deployContract("TinyBank", [await myTokenC.getAddress(), /*signers[0].address, [signers[1].address, signers[2].address, signers[3].address], 3*/]);
        await myTokenC.setManager(await tinyBankC.getAddress());
    });

    describe("Initialized stake check", () => {
        it("should return totalStaked 0", async () => {
            expect(await tinyBankC.totalStaked()).to.equal(0);
        });
        it("should return staked 0 amount of signer0", async () => {
            const signer0 = signers[0];
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    });

    describe("Staking", async () => {
        it("should return staked amount", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await expect(tinyBankC.stake(stakingAmount)).to.emit(tinyBankC, "Staked").withArgs(signer0.address, stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
            expect(await tinyBankC.totalStaked()).equal(stakingAmount);
            expect(await myTokenC.balanceOf(tinyBankC)).equal(await tinyBankC.totalStaked());
        });
    });

    describe("Withdraw", () => {
        it("should return 0 staked after withdrawing total token", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            await expect(tinyBankC.withdraw(stakingAmount)).to.emit(tinyBankC, "Withdraw").withArgs(stakingAmount, signer0.address);
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    });

    describe("reward", () => {
        it("should reward 1MT every blocks", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);

            const BLOCKS = 5n;
            const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
            for (var i = 0; i < BLOCKS; i++) {
                await myTokenC.transfer(transferAmount, signer0.address);
            }

            await tinyBankC.withdraw(stakingAmount);
            expect(await myTokenC.balanceOf(signer0.address)).equal(hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString()));
        });

        it("Should revert when changing rewardPerBlock by hacker", async () => {
            const hacker = signers[3];
            const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
            // await expect(tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange)).to.be.revertedWith("Not all confirmed yet");
            await expect(tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange)).to.be.revertedWith("You are not authorized to manage this contract");
        });
    });

    // describe("Assignment 3", () => {
    //     it("should revert when confirming by manager", async () => {
    //         const hacker = signers[4];
    //         await expect(tinyBankC.connect(hacker).confirm()).to.be.revertedWith("You are not a manager");
    //     });

    //     it("should revert when Not all confirmed yet", async () => {
    //         const manager1 = signers[1];
    //         const manager2 = signers[2];
    //         await tinyBankC.connect(manager1).confirm();
    //         await tinyBankC.connect(manager2).confirm();
    //         await expect(tinyBankC.setRewardPerBlock(hre.ethers.parseUnits("100", DECIMALS))).to.be.revertedWith("Not all confirmed yet");
    //     });

    //     it("should reward 100MT every blocks", async () => {
    //         const manager1 = signers[1];
    //         const manager2 = signers[2];
    //         const manager3 = signers[3];
    //         await tinyBankC.connect(manager1).confirm();
    //         await tinyBankC.connect(manager2).confirm();
    //         await tinyBankC.connect(manager3).confirm();
    //         await tinyBankC.setRewardPerBlock(hre.ethers.parseUnits("100", DECIMALS));

    //         const signer0 = signers[0];
    //         const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
    //         await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
    //         await tinyBankC.stake(stakingAmount);

    //         const BLOCKS = 5n;
    //         const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
    //         for (var i = 0; i < BLOCKS; i++) {
    //             await myTokenC.transfer(transferAmount, signer0.address);
    //         }

    //         await tinyBankC.withdraw(stakingAmount);
    //         expect(await myTokenC.balanceOf(signer0.address)).equal(hre.ethers.parseUnits(((BLOCKS + 1n) * 100n + MINTING_AMOUNT).toString()));
    //     });
    // });
});