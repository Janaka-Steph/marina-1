import { Store, Unsubscribe } from 'redux';
import { POP_UPDATER_TASK } from '../application/redux/actions/action-types';
import { UpdaterTask, UpdaterTaskType } from '../application/redux/reducers/updater-reducer';
import { selectAccount } from '../application/redux/selectors/wallet.selector';
import { RootReducerState } from '../domain/common';
import { makeTxsUpdater, makeUtxosUpdater } from './backend';

function nextUpdaterTask(store: Store<RootReducerState>): Promise<UpdaterTask> {
  const next = store.getState().updater.stack.pop();
  if (next) return Promise.resolve(next);

  let unsubscribe: Unsubscribe;

  return new Promise<UpdaterTask>((resolve) => {
    unsubscribe = store.subscribe(() => {
      const next = store.getState().updater.stack.pop();
      if (next) return resolve(next);
    });
  }).then((task) => {
    unsubscribe();
    return task;
  });
}

export async function startUpdaterWorker(store: Store<RootReducerState>): Promise<void> {
  const maxConcurrentErrors = 10000;
  let errorCount = 0;
  while (errorCount < maxConcurrentErrors) {
    try {
      const nextTask = await nextUpdaterTask(store); // if stack = [] this freeze the loop
      store.dispatch({ type: POP_UPDATER_TASK }); // pop the task from the stack
      const taskResolver = nextTask.type === UpdaterTaskType.TX ? makeTxsUpdater : makeUtxosUpdater;
      await taskResolver(selectAccount(nextTask.accountID))(store);
      errorCount = 0;
    } catch {
      errorCount++;
      console.error('updater error');
    }
  }
}