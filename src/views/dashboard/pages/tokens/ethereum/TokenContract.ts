import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Wallet } from 'xdvplatform-wallet';

export class TokenContract {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private contract: ethers.Contract,
    public defaultAccount: string,
    private signer?: Wallet,
  ) {
  }

  subscribe() {
    return interval(60 * 1000)
      .pipe(
        mergeMap(() => this.contract.methods.balanceOf(this.defaultAccount))
      );
  }

  async send(address: string, amountInWei: string) {
    await this.contract.methods.approve(this.contract.address, (10 * 1e18).toFixed()).call();
    return this.contract.methods.transfer(address, new BigNumber(amountInWei).toFixed())
      .call({
        gas: 285_000,
        from: this.defaultAccount
      });
  }


  async balance(address: string) {
    return this.contract.methods.balanceOf(address)
  }
}