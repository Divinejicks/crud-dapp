const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crud contract", () => {
    let crud = null;
    beforeEach(async () => {
       const Crud = await ethers.getContractFactory("Crud");
        crud = await Crud.deploy();
    });

    describe("User", () => {
        it("Should create a new user", async () => {
            await crud.create("Divine");
            const user = await crud.read(1);

            expect(user[0]).to.equal(1);
            expect(user[1]).to.equal("Divine");
        });

        it("Should update a user", async () => {
            await crud.create("Divine");
            await crud.update(1, "Brun");
            const user = await crud.read(1);
            expect(user[1]).to.equal("Brun");
        });

        it("Should NOT update a non-existing user", async () => {
            await expect(crud.update(2, "Cho")).to.be.revertedWith("User does not exist!");
        });

        it("Should destroy a user", async () => {
            await crud.create("Divine");
            await crud.destroy(1);
            await expect(crud.read(1)).to.be.revertedWith("User does not exist!");
        });

        it("Should not destry a NON exisiting user", async () => {
            await expect(crud.destroy(1)).to.be.revertedWith("User does not exist!");
        });

        it("Should return all users", async () => {
            await crud.create("Divine");
            await crud.create("Cho");
            const users = await crud.readAll();
            expect(users.length).to.equal(2);
        })
    })
})