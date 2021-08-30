import { connect } from 'react-redux';
import { RootReducerState } from '../../../domain/common';
import EndOfFlowOnboardingView, {
  EndOfFlowProps,
} from '../../../presentation/onboarding/end-of-flow';
import { getExplorerURLSelector } from '../selectors/app.selector';

const mapStateToProps = (state: RootReducerState): EndOfFlowProps => {
  return {
    mnemonic: state.onboarding.mnemonic,
    password: state.onboarding.password,
    isFromPopupFlow: state.onboarding.isFromPopupFlow,
    network: state.app.network,
    explorerURL: getExplorerURLSelector(state),
  };
};

const EndOfFlow = connect(mapStateToProps)(EndOfFlowOnboardingView);

export default EndOfFlow;