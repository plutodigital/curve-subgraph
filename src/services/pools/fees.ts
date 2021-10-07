import { BigInt } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'

import { Pool, Coin, DailyFee, WeeklyFee, MonthlyFee } from '../../../generated/schema'
import { formatDate } from '../../utils'

export function getDailyFee(pool: Pool, timestamp: BigInt, coin: Coin): DailyFee {
  let interval = BigInt.fromI32(60 * 60 * 24)
  let day = timestamp.div(interval).times(interval)
  let id = pool.id + '-' + coin.index.toString() +  '-day-' + day.toString()

  let fee = DailyFee.load(id)

  if (fee == null) {
      fee = new DailyFee(id)
      fee.timestamp = day
      fee.date = formatDate(day)
      fee.pool = pool.id
      fee.coin = coin.id
      fee.amount = decimal.ZERO
  }

  return fee
}

export function getWeeklyFee(pool: Pool, timestamp: BigInt, coin: Coin): WeeklyFee {
  let interval = BigInt.fromI32(60 * 60 * 24 * 7)
  let week = timestamp.div(interval).times(interval)
  let id = pool.id + '-' + coin.index.toString() +  '-week-' + week.toString()

  let fee = WeeklyFee.load(id)

  if (fee == null) {
      fee = new WeeklyFee(id)
      fee.timestamp = week
      fee.date = formatDate(week)
      fee.pool = pool.id
      fee.coin = coin.id
      fee.amount = decimal.ZERO
  }

  return fee
}

export function getMonthlyFee(pool: Pool, timestamp: BigInt, coin: Coin): MonthlyFee {
  let interval = BigInt.fromI32(60 * 60 * 24 * 30)
  let month = timestamp.div(interval).times(interval)
  let id = pool.id + '-' + coin.index.toString() +  '-month-' + month.toString()

  let fee = MonthlyFee.load(id)

  if (fee == null) {
      fee = new MonthlyFee(id)
      fee.timestamp = month
      fee.date = formatDate(month)
      fee.pool = pool.id
      fee.coin = coin.id
      fee.amount = decimal.ZERO
  }

  return fee
}

