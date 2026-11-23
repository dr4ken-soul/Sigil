import {
  CreateStartUpPageContainer,
  DeviceConnectType,
  OsEventTypeList,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
} from '@evenrealities/even_hub_sdk'

/** Inputs from the R1 ring, touch surface, microphone and link status. */
export interface InputHandlers {
  onRingTap: () => void
  onRingHold: () => void
  onVoice: (text: string) => void
  onTouch: () => void
  onSwipe: () => void
  onOffline: () => void
  onOnline: () => void
}

/** Browser fallback inputs for the simulator harness. */
export function attachInputs(root: HTMLElement, handlers: InputHandlers): void {
  let downAt = 0
  let holdFired = false
  let startX = 0

  root.addEventListener('pointerdown', (event) => {
    downAt = Date.now()
    holdFired = false
    startX = event.clientX
    window.setTimeout(() => {
      if (downAt && !holdFired && Date.now() - downAt >= 400) {
        holdFired = true
        handlers.onRingHold()
      }
    }, 410)
  })
  root.addEventListener('pointerup', (event) => {
    if (Math.abs(event.clientX - startX) > 12) handlers.onSwipe()
    else if (!holdFired) handlers.onRingTap()
    downAt = 0
  })
  window.addEventListener('keydown', (event) => {
    if (event.key === 'r') handlers.onRingTap()
    if (event.key === 'h') handlers.onRingHold()
    if (event.key === 'v') handlers.onTouch()
  })
  window.addEventListener('offline', handlers.onOffline)
  window.addEventListener('online', handlers.onOnline)
}

/** Render four lines into the native G2 text containers. */
export type BridgeRenderer = (lines: [string, string, string, string]) => void

/**
 * Wire the real Even Hub SDK. In a plain browser the bridge never resolves,
 * so this returns null and the DOM canvas remains the render surface.
 */
export async function initEvenHub(handlers: InputHandlers): Promise<BridgeRenderer | null> {
  const bridge = await Promise.race([
    waitForEvenAppBridge(),
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
  ])
  if (!bridge) return null

  const specs = [
    { id: 1, name: 'header', y: 20, h: 28, text: 3 },
    { id: 2, name: 'statement', y: 56, h: 96, text: 4 },
    { id: 3, name: 'facts', y: 158, h: 72, text: 2 },
    { id: 4, name: 'action', y: 236, h: 32, text: 2 },
  ]
  const containers = specs.map((s) => new TextContainerProperty({
    xPosition: 24,
    yPosition: s.y,
    width: 528,
    height: s.h,
    borderWidth: 0,
    borderColor: 5,
    paddingLength: 2,
    containerID: s.id,
    containerName: s.name,
    isEventCapture: s.id === 2 ? 1 : 0,
    zOrderIndex: s.id,
    content: '',
    textColor: s.text,
  }))
  const created = await bridge.createStartUpPageContainer(new CreateStartUpPageContainer({
    containerTotalNum: containers.length,
    textObject: containers,
  }))
  if (created !== 0) return null

  bridge.onEvenHubEvent((event) => {
    const textEvent = event.textEvent
    const type = textEvent?.eventType
    if (type === OsEventTypeList.CLICK_EVENT) handlers.onRingTap()
    if (type === OsEventTypeList.LONG_PRESS_EVENT) handlers.onRingHold()
    if (type === OsEventTypeList.SCROLL_TOP_EVENT || type === OsEventTypeList.SCROLL_BOTTOM_EVENT) handlers.onSwipe()
    const audio = event.audioEvent as unknown as { text?: string; transcript?: string } | undefined
    const spoken = audio?.text ?? audio?.transcript ?? (event.jsonData?.text as string | undefined)
    if (spoken) handlers.onVoice(spoken)
  })
  bridge.onDeviceStatusChanged((status) => {
    if (status.connectType === DeviceConnectType.Connected) handlers.onOnline()
    else handlers.onOffline()
  })

  return (lines) => {
    void Promise.all(containers.map((container, index) => bridge.textContainerUpgrade(new TextContainerUpgrade({
      containerID: container.containerID,
      containerName: container.containerName,
      content: lines[index],
    }))))
  }
}
