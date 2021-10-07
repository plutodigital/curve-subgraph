import { ethereum, BigInt, json } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

export function getOrNull<T>(result: ethereum.CallResult<T>): T | null {
  return result.reverted ? null : result.value
}

export function formatDate(timestamp: BigInt): String {
  let milliSeconds = timestamp.times(integer.fromNumber(1000))
  let d = new Date(json.toI64(milliSeconds.toString()))
  return d.toUTCString()
}
