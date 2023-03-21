import Browser from 'webextension-polyfill';
import type { NetworkString } from 'marina-provider';
import type { BlockheadersRepository } from '../../domain/repository';
import { DynamicStorageKey } from './dynamic-key';
import type { BlockHeader } from '../../domain/chainsource';

const BlockHeaderKey = new DynamicStorageKey<[network: NetworkString, height: number]>(
  'blockheader'
);

export class BlockHeadersAPI implements BlockheadersRepository {
  async getBlockHeader(network: NetworkString, height: number): Promise<BlockHeader | undefined> {
    const key = BlockHeaderKey.make(network, height);
    const { [key]: blockHeader } = await Browser.storage.local.get(key);
    return blockHeader === null ? undefined : blockHeader;
  }

  async setBlockHeader(network: NetworkString, blockHeader: BlockHeader): Promise<void> {
    const key = BlockHeaderKey.make(network, blockHeader.height);
    await Browser.storage.local.set({ [key]: blockHeader });
  }
}