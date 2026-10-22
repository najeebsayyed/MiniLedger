import { NavigatorScreenParams } from '@react-navigation/native';
import { LoanFilterStatus } from '@miniledger/contracts';

export type AuthStackParamList = {
  Login: undefined;
  Otp: { phoneNumber: string };
};

export type AppTabsParamList = {
  Home: undefined;
  Ledger: { initialFilter?: LoanFilterStatus } | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabsParamList>;
  AddLoan: undefined;
  LoanDetails: { loanId: string };
};
