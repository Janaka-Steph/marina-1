import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import browser from 'webextension-polyfill';
import {
  BACKUP_UNLOCK_ROUTE,
  DEFAULT_ROUTE,
  RECEIVE_ADDRESS_ROUTE,
  SEND_ADDRESS_AMOUNT_ROUTE,
} from '../../routes/constants';
import Balance from '../../components/balance';
import ButtonList from '../../components/button-list';
import ButtonsSendReceive from '../../components/buttons-send-receive';
import ButtonTransaction from '../../components/button-transaction';
import ShellPopUp from '../../components/shell-popup';
import { fromSatoshiWithSpaces } from '../../utility';
import SaveMnemonicModal from '../../components/modal-save-mnemonic';
import type { Asset } from 'marina-provider';
import { useStorageContext } from '../../context/storage-context';

interface LocationState {
  assetHash: string;
}

const Transactions: React.FC = () => {
  const { assetRepository, appRepository, sendFlowRepository, cache } = useStorageContext();

  const {
    state: { assetHash },
  } = useLocation<LocationState>();
  const history = useHistory();
  const [asset, setAsset] = useState<Asset>();

  useEffect(() => {
    (async () => {
      const asset = await assetRepository.getAsset(assetHash);
      setAsset(asset);
    })().catch(console.error);
  }, [assetHash]);

  const [isSaveMnemonicModalOpen, showSaveMnemonicModal] = useState(false);

  const handleSaveMnemonicClose = () => showSaveMnemonicModal(false);

  const handleSaveMnemonicConfirm = async () => {
    await browser.tabs.create({ url: `home.html#${BACKUP_UNLOCK_ROUTE}` });
  };

  const handleReceive = async () => {
    const { isMnemonicVerified } = await appRepository.getStatus();
    if (!isMnemonicVerified) {
      showSaveMnemonicModal(true);
    } else {
      history.push(`${RECEIVE_ADDRESS_ROUTE}/${assetHash}`);
    }
  };

  const handleSend = async () => {
    await sendFlowRepository.setSelectedAsset(assetHash);
    history.push(SEND_ADDRESS_AMOUNT_ROUTE);
  };

  const handleBackBtn = () => history.push(DEFAULT_ROUTE);

  const getFilteredTransactions = () => {
    const seen = new Set();

    return (
      cache?.transactions.value.filter((tx) => {
        if (tx.txFlow[assetHash] === undefined) return false;
        const duplicate = seen.has(tx.txid);
        seen.add(tx.txid);
        return !duplicate;
      }) ?? []
    );
  };

  return (
    <ShellPopUp
      backBtnCb={handleBackBtn}
      backgroundImagePath="/assets/images/popup/bg-home.png"
      className="container mx-auto text-center bg-bottom bg-no-repeat"
      currentPage="Transactions"
    >
      {assetHash && (
        <>
          <Balance
            assetHash={assetHash}
            assetBalance={fromSatoshiWithSpaces(
              cache?.balances.value[assetHash] ?? 0,
              asset?.precision
            )}
            assetTicker={asset?.ticker ?? assetHash.slice(0, 4)}
            bigBalanceText={true}
          />

          <ButtonsSendReceive onReceive={handleReceive} onSend={handleSend} />

          <div className="w-48 mx-auto border-b-0.5 border-white pt-1.5" />

          <div className="h-60 rounded-xl mb-1">
            {asset && (
              <ButtonList title="Transactions" emptyText="Your transactions will appear here">
                {getFilteredTransactions().map((tx, index) => {
                  return <ButtonTransaction txDetails={tx} assetSelected={asset} key={index} />;
                })}
              </ButtonList>
            )}
          </div>
        </>
      )}

      <SaveMnemonicModal
        isOpen={isSaveMnemonicModalOpen}
        handleClose={handleSaveMnemonicClose}
        handleConfirm={handleSaveMnemonicConfirm}
      />
    </ShellPopUp>
  );
};

export default Transactions;
