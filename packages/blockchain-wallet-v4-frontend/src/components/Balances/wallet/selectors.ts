import { add, lift, pathOr, prop, reduce } from 'ramda'
import {
  CoinType,
  InterestAccountBalanceType,
  RemoteDataType,
  SBBalancesType
} from 'core/types'

import { createDeepEqualSelector } from 'services/ReselectHelper'
import { Exchange, Remote } from 'blockchain-wallet-v4/src'
import { formatFiat } from 'core/exchange/currency'
import {
  getErc20Balance as getErc20NonCustodialBalance,
  getEthBalance as getEthNonCustodialBalance,
  getXlmBalance as getXlmNonCustodialBalance
} from '../nonCustodial/selectors'
import { INVALID_COIN_TYPE } from 'blockchain-wallet-v4/src/model'
import { selectors } from 'data'
import BigNumber from 'bignumber.js'

export const getBtcBalance = createDeepEqualSelector(
  [
    selectors.core.wallet.getSpendableContext,
    selectors.core.data.btc.getAddresses,
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (context, addressesR, interestAccountBalanceR, sbBalancesR) => {
    const contextToBalances = (
      context,
      balances,
      interestAccountBalance: InterestAccountBalanceType,
      sbBalances: SBBalancesType
    ): Array<number> => {
      const walletBalances: Array<number> = context.map(a =>
        pathOr(0, [a, 'final_balance'], balances)
      )
      const interestBalance = interestAccountBalance.BTC
        ? parseInt(interestAccountBalance.BTC.balance)
        : 0
      const sbBalance = Number(sbBalances.BTC ? sbBalances.BTC.available : 0)
      return walletBalances.concat(sbBalance).concat(interestBalance)
    }
    const balancesR = lift(contextToBalances)(
      Remote.of(context),
      addressesR,
      interestAccountBalanceR,
      sbBalancesR
    )
    return balancesR.map(reduce<number, number>(add, 0))
  }
)

export const getBchBalance = createDeepEqualSelector(
  [
    selectors.core.kvStore.bch.getSpendableContext,
    selectors.core.data.bch.getAddresses,
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (context, addressesR, interestAccountBalanceR, sbBalancesR) => {
    const contextToBalances = (
      context,
      balances,
      interestAccountBalance: InterestAccountBalanceType,
      sbBalances: SBBalancesType
    ) => {
      const walletBalances: Array<number> = context.map(a =>
        pathOr(0, [a, 'final_balance'], balances)
      )
      const interestBalance = interestAccountBalance.BCH
        ? parseInt(interestAccountBalance.BCH.balance)
        : 0
      const sbBalance = Number(sbBalances.BCH ? sbBalances.BCH.available : 0)
      return walletBalances.concat(sbBalance).concat(interestBalance)
    }
    const balancesR = lift(contextToBalances)(
      Remote.of(context),
      addressesR,
      interestAccountBalanceR,
      sbBalancesR
    )
    return balancesR.map(reduce<number, number>(add, 0))
  }
)

export const getEthBalance = createDeepEqualSelector(
  [
    getEthNonCustodialBalance,
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (
    balancesR,
    interestAccountBalanceR: RemoteDataType<string, InterestAccountBalanceType>,
    sbBalancesR: RemoteDataType<string, SBBalancesType>
  ) => {
    const interestEthBalance = interestAccountBalanceR.getOrElse({
      ETH: { balance: 0 }
    }).ETH
    const interestBalance = interestEthBalance ? interestEthBalance.balance : 0
    const sbEthBalance = sbBalancesR.getOrElse({ ETH: { available: '0' } }).ETH
    const sbBalance = sbEthBalance ? sbEthBalance.available : '0'

    return Remote.of(
      new BigNumber(balancesR.getOrElse(0))
        .plus(new BigNumber(sbBalance))
        .plus(new BigNumber(interestBalance))
    )
  }
)

export const getPaxBalance = createDeepEqualSelector(
  [
    getErc20NonCustodialBalance('pax'),
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (
    balanceR,
    interestAccountBalanceR: RemoteDataType<string, InterestAccountBalanceType>,
    sbBalancesR: RemoteDataType<string, SBBalancesType>
  ) => {
    const interestPaxBalance = interestAccountBalanceR.getOrElse({
      PAX: { balance: '0' }
    }).PAX
    const interestBalance = interestPaxBalance
      ? interestPaxBalance.balance
      : '0'
    const sbPaxBalance = sbBalancesR.getOrElse({ PAX: { available: '0' } }).PAX
    const sbBalance = sbPaxBalance ? sbPaxBalance.available : '0'

    return Remote.of(
      new BigNumber(balanceR.getOrElse(0))
        .plus(new BigNumber(sbBalance))
        .plus(new BigNumber(interestBalance))
    )
  }
)

export const getUsdtBalance = createDeepEqualSelector(
  [
    getErc20NonCustodialBalance('usdt'),
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (
    balanceR,
    interestAccountBalanceR: RemoteDataType<string, InterestAccountBalanceType>,
    sbBalancesR: RemoteDataType<string, SBBalancesType>
  ) => {
    const interestUsdtBalance = interestAccountBalanceR.getOrElse({
      USDT: { balance: '0' }
    }).USDT
    const interestBalance = interestUsdtBalance
      ? interestUsdtBalance.balance
      : '0'
    const sbUsdtBalance = sbBalancesR.getOrElse({ USDT: { available: '0' } })
      .USDT
    const sbBalance = sbUsdtBalance ? sbUsdtBalance.available : '0'

    return Remote.of(
      new BigNumber(balanceR.getOrElse(0))
        .plus(new BigNumber(sbBalance))
        .plus(new BigNumber(interestBalance))
    )
  }
)

export const getXlmBalance = createDeepEqualSelector(
  [
    getXlmNonCustodialBalance,
    selectors.components.interest.getInterestAccountBalance,
    selectors.components.simpleBuy.getSBBalances
  ],
  (
    balanceR,
    interestAccountBalanceR: RemoteDataType<string, InterestAccountBalanceType>,
    sbBalancesR: RemoteDataType<string, SBBalancesType>
  ) => {
    const interestXlmBalance = interestAccountBalanceR.getOrElse({
      PAX: { balance: '0' }
    }).PAX
    const interestBalance = interestXlmBalance
      ? interestXlmBalance.balance
      : '0'
    const sbXlmBalance = sbBalancesR.getOrElse({ XLM: { available: '0' } }).XLM
    const sbBalance = sbXlmBalance ? sbXlmBalance.available : '0'

    return Remote.of(
      new BigNumber(balanceR.getOrElse(0))
        .plus(new BigNumber(sbBalance))
        .plus(new BigNumber(interestBalance))
    )
  }
)

export const getAlgoBalance = createDeepEqualSelector(
  [selectors.components.simpleBuy.getSBBalances],
  (sbBalancesR: RemoteDataType<string, SBBalancesType>) => {
    const sbAlgoBalance = sbBalancesR.getOrElse({ ALGO: { available: '0' } })
      .ALGO
    const sbBalance = sbAlgoBalance ? sbAlgoBalance.available : '0'

    return Remote.of(new BigNumber(sbBalance))
  }
)

export const getBtcBalanceInfo = createDeepEqualSelector(
  [
    getBtcBalance,
    selectors.core.data.btc.getRates,
    selectors.core.settings.getCurrency
  ],
  (btcBalanceR, btcRatesR, currencyR) => {
    const transform = (value, rates, toCurrency) =>
      Exchange.convertBtcToFiat({
        value,
        fromUnit: 'SAT',
        toCurrency,
        rates
      }).value
    return lift(transform)(btcBalanceR, btcRatesR, currencyR)
  }
)

export const getBchBalanceInfo = createDeepEqualSelector(
  [
    getBchBalance,
    selectors.core.data.bch.getRates,
    selectors.core.settings.getCurrency
  ],
  (bchBalanceR, bchRatesR, currencyR) => {
    const transform = (value, rates, toCurrency) =>
      Exchange.convertBchToFiat({ value, fromUnit: 'SAT', toCurrency, rates })
        .value
    return lift(transform)(bchBalanceR, bchRatesR, currencyR)
  }
)

export const getEthBalanceInfo = createDeepEqualSelector(
  [
    getEthBalance,
    selectors.core.data.eth.getRates,
    selectors.core.settings.getCurrency
  ],
  (ethBalanceR, ethRatesR, currencyR) => {
    const transform = (value, rates, toCurrency) => {
      return Exchange.convertEthToFiat({
        value,
        fromUnit: 'WEI',
        toCurrency,
        rates
      }).value
    }

    return lift(transform)(ethBalanceR, ethRatesR, currencyR)
  }
)

export const getPaxBalanceInfo = createDeepEqualSelector(
  [
    getPaxBalance,
    state => selectors.core.data.eth.getErc20Rates(state, 'pax'),
    selectors.core.settings.getCurrency,
    selectors.core.settings.getInvitations
  ],
  (paxBalanceR, erc20RatesR, currencyR, invitationsR) => {
    const invitations = invitationsR.getOrElse({ PAX: false })
    const invited = prop('PAX', invitations)
    const transform = (value, rates, toCurrency) => {
      return Exchange.convertPaxToFiat({
        value,
        fromUnit: 'WEI',
        toCurrency,
        rates
      }).value
    }

    return invited
      ? lift(transform)(paxBalanceR, erc20RatesR, currencyR)
      : Remote.Success(0)
  }
)

export const getXlmBalanceInfo = createDeepEqualSelector(
  [
    getXlmBalance,
    selectors.core.data.xlm.getRates,
    selectors.core.settings.getCurrency
  ],
  (xlmBalanceR, xlmRatesR, currencyR) => {
    const transform = (value, rates, toCurrency) =>
      Exchange.convertXlmToFiat({
        value,
        fromUnit: 'STROOP',
        toCurrency,
        rates
      }).value
    return lift(transform)(xlmBalanceR, xlmRatesR, currencyR)
  }
)

export const getAlgoBalanceInfo = createDeepEqualSelector(
  [
    getAlgoBalance,
    selectors.core.data.algo.getRates,
    selectors.core.settings.getCurrency
  ],
  (algoBalanceR, algoRatesR, currencyR) => {
    const transform = (value, rates, toCurrency) =>
      Exchange.convertAlgoToFiat({
        value,
        fromUnit: 'mALGO',
        toCurrency,
        rates
      }).value
    return lift(transform)(algoBalanceR, algoRatesR, currencyR)
  }
)

export const getTotalBalance = createDeepEqualSelector(
  [
    getBchBalanceInfo,
    getBtcBalanceInfo,
    getEthBalanceInfo,
    getPaxBalanceInfo,
    getXlmBalanceInfo,
    selectors.core.settings.getCurrency
  ],
  (
    btcBalanceInfoR,
    bchBalanceInfoR,
    ethBalanceInfoR,
    paxBalanceInfoR,
    xlmBalanceInfoR,
    currency
  ) => {
    const transform = (
      bchBalance,
      btcBalance,
      ethBalance,
      paxBalance,
      xlmBalance,
      currency
    ) => {
      const total = formatFiat(
        Number(btcBalance) +
          Number(ethBalance) +
          Number(bchBalance) +
          Number(paxBalance) +
          Number(xlmBalance)
      )
      const totalBalance = `${Exchange.getSymbol(currency)}${total}`
      return { totalBalance }
    }
    return lift(transform)(
      bchBalanceInfoR,
      btcBalanceInfoR,
      ethBalanceInfoR,
      paxBalanceInfoR,
      xlmBalanceInfoR,
      currency
    )
  }
)

export const getBalanceSelector = (coin: CoinType) => {
  switch (coin) {
    case 'BTC':
      return getBtcBalance
    case 'BCH':
      return getBchBalance
    case 'ETH':
      return getEthBalance
    case 'PAX':
      return getPaxBalance
    case 'XLM':
      return getXlmBalance
    case 'USDT':
      return getUsdtBalance
    case 'ALGO':
      return getAlgoBalance
    default:
      return Remote.Failure(INVALID_COIN_TYPE)
  }
}
