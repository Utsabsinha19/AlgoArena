// ============================================================================
// AlgoArena v4.0 - WebRTC Peer-to-Peer Telemetry & Sync (Section 3)
// Direct RTCDataChannel stream for ultra-low latency (<15ms) head-to-head racing
// ============================================================================

export interface DecodedP2PTelemetry {
  msgType: number;
  algoId: number;
  stepIndex: number;
  currentNode: number;
  nodesExplored: number;
}

export class P2PNetworkSync {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: (data: ArrayBuffer) => void;
  private onIceCandidateCallback?: (candidate: RTCIceCandidate | null) => void;
  private onStateChangeCallback?: (state: RTCPeerConnectionState) => void;

  constructor(onMessageCallback: (data: ArrayBuffer) => void) {
    this.onMessageCallback = onMessageCallback;
    this.initPeer();
  }

  private initPeer() {
    if (typeof RTCPeerConnection === 'undefined') {
      return;
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    this.peerConnection.onicecandidate = (event) => {
      this.onIceCandidateCallback?.(event.candidate);
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.onStateChangeCallback?.(this.peerConnection.connectionState);
      }
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.binaryType = 'arraybuffer';
    this.dataChannel.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        this.onMessageCallback(e.data);
      }
    };
  }

  /**
   * Initializes outbound data channel for the peer initiating the connection
   */
  public createDataChannel(label: string = 'algoarena-telemetry'): RTCDataChannel | null {
    if (!this.peerConnection) return null;
    const channel = this.peerConnection.createDataChannel(label, { ordered: false });
    this.setupDataChannel(channel);
    return channel;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    this.createDataChannel();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  public async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(answer);
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;
    await this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * Transmits 12-byte packed binary telemetry frame across RTCDataChannel
   */
  public sendTelemetryPacket(
    algoId: number,
    stepIndex: number,
    currentNode: number,
    nodesExplored: number
  ) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);
      view.setUint8(0, 1); // MsgType 1: Telemetry
      view.setUint8(1, algoId);
      view.setUint16(2, stepIndex, true);
      view.setUint32(4, currentNode, true);
      view.setUint32(8, nodesExplored, true);
      this.dataChannel.send(buffer);
    }
  }

  public static parseTelemetryPacket(buffer: ArrayBuffer): DecodedP2PTelemetry {
    const view = new DataView(buffer);
    return {
      msgType: view.getUint8(0),
      algoId: view.getUint8(1),
      stepIndex: view.getUint16(2, true),
      currentNode: view.getUint32(4, true),
      nodesExplored: view.getUint32(8, true),
    };
  }

  public setOnIceCandidate(cb: (candidate: RTCIceCandidate | null) => void) {
    this.onIceCandidateCallback = cb;
  }

  public setOnConnectionStateChange(cb: (state: RTCPeerConnectionState) => void) {
    this.onStateChangeCallback = cb;
  }

  public getChannelState(): RTCDataChannelState | 'closed' {
    return this.dataChannel ? this.dataChannel.readyState : 'closed';
  }

  public close() {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
  }
}
