import { ABTestCmdType } from 'data/analytics/types'
import { actions, model } from 'data'
import { bindActionCreators, compose } from 'redux'
import { connect, ConnectedProps } from 'react-redux'
import { debounce } from 'utils/helpers'
import { getData } from './selectors'
import { isEmpty } from 'ramda'
import { reduxForm } from 'redux-form'
import { Remote } from 'blockchain-wallet-v4/src'
import DataError from 'components/DataError'
import Loading from './template.loading'
import React from 'react'
import Success from './template.success'

const extractFieldValue = (e, value) => {
  return value
}

const { swapCoinAndFiat, swapBaseAndCounter } = model.rates
const { EXCHANGE_FORM } = model.components.exchange

class ExchangeForm extends React.Component<Props> {
  componentDidMount () {
    this.props.analyticsActions.createABTest('SwapFees')

    setTimeout(() => {
      if (!Remote.Success.is(this.props.data)) {
        this.props.analyticsActions.createABTestSuccess('SwapFees', {
          to: 'swap',
          from: 'matomo',
          command: 'priority'
        })
      }
    }, 3000)

    window.addEventListener('message', this.receiveMessage)
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data
  }

  componentWillUnmount () {
    this.props.actions.setShowError(false)
    window.removeEventListener('message', this.receiveMessage)
  }

  debounceTime = 50
  changeAmount = debounce(this.props.actions.changeAmount, this.debounceTime)

  receiveMessage = (e: { data: ABTestCmdType }) => {
    if (!e.data) return
    if (e.data.from !== 'matomo') return
    if (e.data.to !== 'swap') return

    this.props.analyticsActions.createABTestSuccess('SwapFees', e.data)
  }

  initialize = () => {
    const { actions, from, to, fix, amount } = this.props
    actions.initialize({ from, to, fix, amount })
  }

  handleRefresh = () => {
    this.initialize()
  }

  clearZero = e => {
    if (e.target.value === '0') {
      this.props.formActions.change(EXCHANGE_FORM, e.target.name, '')
    }
  }

  addZero = e => {
    if (e.target.value === '') {
      requestAnimationFrame(() =>
        this.props.formActions.change(EXCHANGE_FORM, e.target.name, '0')
      )
    }
  }

  render () {
    const { actions, data, showError, txError } = this.props
    return data.cata({
      Success: value =>
        isEmpty(value.availablePairs) ? (
          <DataError onClick={this.handleRefresh} />
        ) : (
          <Success
            {...value}
            showError={showError}
            txError={txError}
            handleSubmit={actions.showConfirmation}
            handleSourceChange={compose(
              actions.changeSource,
              extractFieldValue
            )}
            handleTargetChange={compose(
              actions.changeTarget,
              extractFieldValue
            )}
            handleAmountChange={compose(this.changeAmount, extractFieldValue)}
            handleInputFocus={e => {
              this.clearZero(e)
            }}
            handleInputBlur={this.addZero}
            initialize={this.initialize}
            swapFix={compose(
              actions.changeFix,
              swapBaseAndCounter.bind(null, value.fix)
            )}
            swapCoinAndFiat={compose(
              actions.changeFix,
              swapCoinAndFiat.bind(null, value.fix)
            )}
          />
        ),
      Failure: message => (
        <DataError onClick={this.handleRefresh} message={message} />
      ),
      Loading: () => <Loading />,
      NotAsked: () => <Loading />
    })
  }
}

const mapStateToProps = state => ({
  data: getData(state)
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions.components.exchange, dispatch),
  analyticsActions: bindActionCreators(actions.analytics, dispatch),
  formActions: bindActionCreators(actions.form, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)

const enhance = compose(
  reduxForm({
    form: EXCHANGE_FORM,
    destroyOnUnmount: true,
    persistentSubmitErrors: true
  }),
  connector
)

type ExchangeFormValuesType = {
  amount: any
  fix: any
  from: any
  to: any
}

type Props = ConnectedProps<typeof connector> &
  ExchangeFormValuesType & {
    showError: boolean
    txError: any
  }

export default enhance(ExchangeForm)
