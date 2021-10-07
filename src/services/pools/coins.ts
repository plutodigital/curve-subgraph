import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'

import { Registry } from '../../../generated/MainRegistry/Registry'
import { Coin, Pool, UnderlyingCoin, CoinBalance, TotalBalance } from '../../../generated/schema'

import { getOrCreateToken } from '../tokens'
import { getOrNull, formatDate } from '../../utils'

export function saveCoins(pool: Pool, event: ethereum.Event): void {
  let registryContract = Registry.bind(changetype<Address>(pool.registryAddress))
  let poolContract = Registry.bind(changetype<Address>(pool.swapAddress))

  let coins = getOrNull<Address[]>(registryContract.try_get_coins(poolContract._address))
  let underlyingCoins = getOrNull<Address[]>(registryContract.try_get_underlying_coins(poolContract._address))

  let allCoinsSymbols:string[] = []
  let totalBalance = decimal.ZERO;
  if (coins) {
    let balances = getOrNull<BigInt[]>(registryContract.try_get_balances(poolContract._address))
    let rates = getOrNull<BigInt[]>(registryContract.try_get_rates(poolContract._address))

    for (let i = 0, count = pool.coinCount.toI32(); i < count; ++i) {
      let token = getOrCreateToken(coins[i], event)
      allCoinsSymbols.push(token.symbol ? "": token.symbol!);

      let coin = new Coin(pool.id + '-' + i.toString())
      coin.index = i
      coin.pool = pool.id
      coin.token = token.id
      coin.underlying = coin.id
      coin.balance = balances ? decimal.fromBigInt(balances[i], token.decimals.toI32()) : decimal.ZERO
      coin.rate = rates ? decimal.fromBigInt(rates[i]) : decimal.ONE
      coin.updated = event.block.timestamp
      coin.updatedAtBlock = event.block.number
      coin.updatedAtTransaction = event.transaction.hash
      coin.save()

      let coinBalance = new CoinBalance(pool.id + '-' + i.toString() + '-' + event.block.number.toString())
      coinBalance.pool = pool.id
      coinBalance.index = i
      coinBalance.coin = coin.id
      coinBalance.timestamp = event.block.timestamp
      coinBalance.date = formatDate(event.block.timestamp)
      coinBalance.balance = balances ? decimal.fromBigInt(balances[i], token.decimals.toI32()) : decimal.ZERO
      coinBalance.save()

      totalBalance = totalBalance.plus(coin.balance)
    }
  }

  let tb = new TotalBalance(pool.id + '-total-balance-' + event.block.number.toString())
  tb.pool = pool.id
  tb.timestamp = event.block.timestamp
  tb.balance = totalBalance
  tb.name = allCoinsSymbols.join("+")
  tb.date = formatDate(event.block.timestamp)
  tb.save()

  if (underlyingCoins) {
    let balances = getOrNull<BigInt[]>(registryContract.try_get_underlying_balances(poolContract._address))

    for (let i = 0, count = pool.underlyingCount.toI32(); i < count; ++i) {
      let token = getOrCreateToken(underlyingCoins[i], event)

      let coin = new UnderlyingCoin(pool.id + '-' + i.toString())
      coin.index = i
      coin.pool = pool.id
      coin.token = token.id
      coin.coin = coin.id
      coin.balance = balances ? decimal.fromBigInt(balances[i]) : decimal.ZERO
      coin.updated = event.block.timestamp
      coin.updatedAtBlock = event.block.number
      coin.updatedAtTransaction = event.transaction.hash
      coin.save()
    }
  }
}
