// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { filter, fromEventPattern, share, take, takeWhile } from 'rxjs'
import Browser from 'webextension-polyfill'

const windowRemovedStream = fromEventPattern<number>(
  (handler) => Browser.windows.onRemoved.addListener(handler),
  (handler) => Browser.windows.onRemoved.removeListener(handler)
).pipe(share())

export class Window {
  private _id: number | null = null
  private _url: string
  private _width: number
  private _height: number

  constructor({
    url,
    width = 370,
    height = 460,
  }: {
    url: string
    width?: number
    height?: number
  }) {
    this._url = url
    this._width = width
    this._height = height
  }

  public async show() {
    const {
      width = 0,
      left = 0,
      top = 0,
    } = await Browser.windows.getLastFocused()
    const w = await Browser.windows.create({
      url: this._url,
      focused: true,
      width: this._width,
      height: this._height,
      type: 'popup',
      top: top,
      left: Math.floor(left + width - 450),
    })
    this._id = typeof w.id === 'undefined' ? null : w.id
    return windowRemovedStream.pipe(
      takeWhile(() => this._id !== null),
      filter((aWindowID) => aWindowID === this._id),
      take(1)
    )
  }

  public async close() {
    if (this._id !== null) {
      await Browser.windows.remove(this._id)
    }
  }
}
