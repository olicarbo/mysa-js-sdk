/*
mysa-js-sdk
Copyright (C) 2025 Pascal Bourque

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


// src/api/Errors.ts
var UnauthenticatedError = class extends Error {
  /**
   * Creates a new UnauthenticatedError instance.
   *
   * @param message - The error message
   */
  constructor(message) {
    super(message);
    this.name = "UnauthenticatedError";
  }
};
var MysaApiError = class extends Error {
  /** The HTTP status code returned by the API */
  status;
  /** The HTTP status text returned by the API */
  statusText;
  /**
   * Creates a new MysaApiError instance.
   *
   * @param apiResponse - The failed Response object from the API call
   */
  constructor(apiResponse) {
    super(
      `Failed to call the '${apiResponse.url}' Mysa API endpoint. The server responded with a status of ${apiResponse.status} (${apiResponse.statusText}).`
    );
    this.name = "MysaApiError";
    this.status = apiResponse.status;
    this.statusText = apiResponse.statusText;
  }
};
var MqttPublishError = class extends Error {
  /**
   * Creates a new MqttPublishError instance.
   *
   * @param message - A human-readable description of the publish failure.
   * @param attempts - The number of attempts that were made before giving up.
   * @param original - The original error object thrown by the underlying MQTT library (optional).
   */
  constructor(message, attempts, original) {
    super(message);
    this.attempts = attempts;
    this.original = original;
    this.name = "MqttPublishError";
  }
};

// src/api/Logger.ts
var VoidLogger = class {
  debug(message, ...meta) {
  }
  info(message, ...meta) {
  }
  warn(message, ...meta) {
  }
  error(message, ...meta) {
  }
};

// src/lib/EventEmitter.ts
import { EventEmitter as NodeEventEmitter } from "events";
var EventEmitter = class {
  _emitter = new NodeEventEmitter();
  emit(eventName, ...eventArg) {
    return this._emitter.emit(eventName, ...eventArg);
  }
  on(eventName, handler) {
    this._emitter.on(eventName, handler);
    return this;
  }
  once(eventName, handler) {
    this._emitter.once(eventName, handler);
    return this;
  }
  off(eventName, handler) {
    this._emitter.off(eventName, handler);
    return this;
  }
  addListener(eventName, listener) {
    this._emitter.addListener(eventName, listener);
    return this;
  }
  removeListener(eventName, listener) {
    this._emitter.removeListener(eventName, listener);
    return this;
  }
  removeAllListeners(eventName) {
    this._emitter.removeAllListeners(eventName);
    return this;
  }
  setMaxListeners(n) {
    this._emitter.setMaxListeners(n);
    return this;
  }
  getMaxListeners() {
    return this._emitter.getMaxListeners();
  }
  listeners(eventName) {
    return this._emitter.listeners(eventName);
  }
  rawListeners(eventName) {
    return this._emitter.rawListeners(eventName);
  }
  listenerCount(eventName, listener) {
    return this._emitter.listenerCount(eventName, listener);
  }
  prependListener(eventName, listener) {
    this._emitter.prependListener(eventName, listener);
    return this;
  }
  prependOnceListener(eventName, listener) {
    this._emitter.prependOnceListener(eventName, listener);
    return this;
  }
  eventNames() {
    return this._emitter.eventNames();
  }
};

// src/lib/PayloadParser.ts
function parseMqttPayload(payload) {
  try {
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(payload);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing MQTT payload:", error);
    throw new Error("Failed to parse MQTT payload");
  }
}
function serializeMqttPayload(payload) {
  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  return encoder.encode(jsonString);
}

// src/lib/PayloadTypeGuards.ts
function isMsgTypeOutPayload(payload) {
  return "MsgType" in payload;
}
function isMsgOutPayload(payload) {
  return "msg" in payload;
}

// src/types/mqtt/in/InMessageType.ts
var InMessageType = /* @__PURE__ */ ((InMessageType2) => {
  InMessageType2[InMessageType2["CHECK_DEVICE_SETTINGS"] = 6] = "CHECK_DEVICE_SETTINGS";
  InMessageType2[InMessageType2["START_PUBLISHING_DEVICE_STATUS"] = 11] = "START_PUBLISHING_DEVICE_STATUS";
  InMessageType2[InMessageType2["CHANGE_DEVICE_STATE"] = 44] = "CHANGE_DEVICE_STATE";
  return InMessageType2;
})(InMessageType || {});

// src/types/mqtt/out/OutMessageType.ts
var OutMessageType = /* @__PURE__ */ ((OutMessageType2) => {
  OutMessageType2[OutMessageType2["DEVICE_V1_STATUS"] = 0] = "DEVICE_V1_STATUS";
  OutMessageType2[OutMessageType2["DEVICE_SETPOINT_CHANGE"] = 1] = "DEVICE_SETPOINT_CHANGE";
  OutMessageType2[OutMessageType2["DEVICE_LOG"] = 4] = "DEVICE_LOG";
  OutMessageType2[OutMessageType2["DEVICE_POST_BOOT"] = 10] = "DEVICE_POST_BOOT";
  OutMessageType2[OutMessageType2["DEVICE_V2_STATUS"] = 40] = "DEVICE_V2_STATUS";
  OutMessageType2[OutMessageType2["DEVICE_STATE_CHANGE"] = 44] = "DEVICE_STATE_CHANGE";
  return OutMessageType2;
})(OutMessageType || {});

// src/api/MysaApiClient.ts
import { DescribeThingCommand, IoTClient } from "@aws-sdk/client-iot";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession
} from "amazon-cognito-identity-js";
import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { hash } from "crypto";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { customAlphabet } from "nanoid";
dayjs.extend(duration);
var getRandomClientId = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);
var AwsRegion = "us-east-1";
var CognitoUserPoolId = "us-east-1_GUFWfhI7g";
var CognitoClientId = "19efs8tgqe942atbqmot5m36t3";
var CognitoIdentityPoolId = "us-east-1:ebd95d52-9995-45da-b059-56b865a18379";
var CognitoLoginKey = `cognito-idp.${AwsRegion}.amazonaws.com/${CognitoUserPoolId}`;
var MqttEndpoint = "a3q27gia9qg3zy-ats.iot.us-east-1.amazonaws.com";
var MysaApiBaseUrl = "https://app-prod.mysa.cloud";
var RealtimeKeepAliveInterval = dayjs.duration(5, "minutes");
var MysaApiClient = class {
  /** The current session object, if any. */
  _cognitoUserSession;
  /** The current user object, if any. */
  _cognitoUser;
  /** The logger instance used by the client. */
  _logger;
  /** The fetcher function used by the client. */
  _fetcher;
  /** A promise that resolves to the MQTT connection used for real-time updates. */
  _mqttConnectionPromise;
  /** Stable per-process MQTT client id (prevents collisions between multiple processes). */
  _mqttClientId;
  /** Expiration time of the credentials currently in use by the MQTT client. */
  _mqttCredentialsExpiration;
  /** Interrupt timestamps for storm / collision detection. */
  _mqttInterrupts = [];
  /** Whether a forced MQTT reset is currently in progress (guards against re-entrancy). */
  _mqttResetInProgress = false;
  /** The device IDs that are currently being updated in real-time, mapped to their respective timeouts. */
  _realtimeDeviceIds = /* @__PURE__ */ new Map();
  /** The cached devices object, if any. */
  _cachedDevices;
  /**
   * Event emitter for client events.
   *
   * @see {@link MysaApiClientEventTypes} for the possible events and their payloads.
   */
  emitter = new EventEmitter();
  /**
   * Gets the persistable session object.
   *
   * @returns The current persistable session object, if any.
   */
  get session() {
    if (!this._cognitoUserSession || !this._cognitoUser) {
      return void 0;
    }
    return {
      username: this._cognitoUser.getUsername(),
      idToken: this._cognitoUserSession.getIdToken().getJwtToken(),
      accessToken: this._cognitoUserSession.getAccessToken().getJwtToken(),
      refreshToken: this._cognitoUserSession.getRefreshToken().getToken()
    };
  }
  /**
   * Returns whether the client currently has an active session.
   *
   * @returns True if the client has an active session, false otherwise.
   */
  get isAuthenticated() {
    return !!this.session;
  }
  /**
   * Constructs a new instance of the MysaApiClient.
   *
   * @param session - The persistable session object, if any.
   * @param options - The options for the client.
   */
  constructor(session, options) {
    this._logger = (options == null ? void 0 : options.logger) || new VoidLogger();
    this._fetcher = (options == null ? void 0 : options.fetcher) || fetch;
    if (session) {
      this._cognitoUser = new CognitoUser({
        Username: session.username,
        Pool: new CognitoUserPool({ UserPoolId: CognitoUserPoolId, ClientId: CognitoClientId })
      });
      this._cognitoUserSession = new CognitoUserSession({
        IdToken: new CognitoIdToken({ IdToken: session.idToken }),
        AccessToken: new CognitoAccessToken({ AccessToken: session.accessToken }),
        RefreshToken: new CognitoRefreshToken({ RefreshToken: session.refreshToken })
      });
    }
  }
  /**
   * Logs in the user with the given email address and password.
   *
   * This method authenticates the user with Mysa's Cognito user pool and establishes a session that can be used for
   * subsequent API calls. Upon successful login, a 'sessionChanged' event is emitted.
   *
   * @example
   *
   * ```typescript
   * try {
   *   await client.login('user@example.com', 'password123');
   *   console.log('Login successful!');
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   *
   * @param emailAddress - The email address of the user.
   * @param password - The password of the user.
   * @throws {@link Error} When authentication fails due to invalid credentials or network issues.
   */
  async login(emailAddress, password) {
    this._cognitoUser = void 0;
    this._cognitoUserSession = void 0;
    this._mqttClientId = void 0;
    this._mqttInterrupts = [];
    this.emitter.emit("sessionChanged", this.session);
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: emailAddress,
        Pool: new CognitoUserPool({ UserPoolId: CognitoUserPoolId, ClientId: CognitoClientId })
      });
      user.authenticateUser(new AuthenticationDetails({ Username: emailAddress, Password: password }), {
        onSuccess: (session) => {
          this._cognitoUser = user;
          this._cognitoUserSession = session;
          this.emitter.emit("sessionChanged", this.session);
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }
  /**
   * Retrieves the list of devices associated with the user.
   *
   * This method fetches all Mysa devices linked to the authenticated user's account, including device information such
   * as models, locations, and configuration details.
   *
   * @example
   *
   * ```typescript
   * const devices = await client.getDevices();
   * for (const [deviceId, device] of Object.entries(devices.DevicesObj)) {
   *   console.log(`Device: ${device.DisplayName} (${device.Model})`);
   * }
   * ```
   *
   * @returns A promise that resolves to the list of devices.
   * @throws {@link MysaApiError} When the API request fails.
   * @throws {@link UnauthenticatedError} When the user is not authenticated.
   */
  async getDevices() {
    this._logger.debug(`Fetching devices...`);
    const session = await this._getFreshSession();
    const response = await this._fetcher(`${MysaApiBaseUrl}/devices`, {
      headers: {
        Authorization: `${session.getIdToken().getJwtToken()}`
      }
    });
    if (!response.ok) {
      throw new MysaApiError(response);
    }
    return response.json();
  }
  /**
   * Retrieves the serial number for a specific device.
   *
   * This method uses AWS IoT's DescribeThing API to fetch the serial number attribute for the specified device. This
   * requires additional AWS IoT permissions and may not be available for all devices.
   *
   * @example
   *
   * ```typescript
   * const serialNumber = await client.getDeviceSerialNumber('device123');
   * if (serialNumber) {
   *   console.log(`Device serial: ${serialNumber}`);
   * } else {
   *   console.log('Serial number not available');
   * }
   * ```
   *
   * @param deviceId - The ID of the device to get the serial number for.
   * @returns A promise that resolves to the serial number, or undefined if not found.
   * @throws {@link UnauthenticatedError} When the user is not authenticated.
   */
  async getDeviceSerialNumber(deviceId) {
    var _a;
    this._logger.debug(`Fetching serial number for device ${deviceId}...`);
    const session = await this._getFreshSession();
    const credentialsProvider = fromCognitoIdentityPool({
      clientConfig: {
        region: AwsRegion
      },
      identityPoolId: CognitoIdentityPoolId,
      logins: {
        [CognitoLoginKey]: session.getIdToken().getJwtToken()
      }
    });
    const credentials = await credentialsProvider();
    const iotClient = new IoTClient({
      region: AwsRegion,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });
    try {
      const command = new DescribeThingCommand({ thingName: deviceId });
      const response = await iotClient.send(command);
      return (_a = response.attributes) == null ? void 0 : _a["Serial"];
    } catch (error) {
      this._logger.warn(`Could not get serial number for device ${deviceId}:`, error);
      return void 0;
    }
  }
  /**
   * Retrieves firmware information for all devices.
   *
   * @returns A promise that resolves to the firmware information for all devices.
   * @throws {@link MysaApiError} When the API request fails.
   * @throws {@link UnauthenticatedError} When the user is not authenticated.
   */
  async getDeviceFirmwares() {
    this._logger.debug(`Fetching device firmwares...`);
    const session = await this._getFreshSession();
    const response = await this._fetcher(`${MysaApiBaseUrl}/devices/firmware`, {
      headers: {
        Authorization: `${session.getIdToken().getJwtToken()}`
      }
    });
    if (!response.ok) {
      throw new MysaApiError(response);
    }
    return response.json();
  }
  /**
   * Retrieves the current state information for all devices.
   *
   * @returns A promise that resolves to the current state of all devices.
   * @throws {@link MysaApiError} When the API request fails.
   * @throws {@link UnauthenticatedError} When the user is not authenticated.
   */
  async getDeviceStates() {
    this._logger.debug(`Fetching device states...`);
    const session = await this._getFreshSession();
    const response = await this._fetcher(`${MysaApiBaseUrl}/devices/state`, {
      headers: {
        Authorization: `${session.getIdToken().getJwtToken()}`
      }
    });
    if (!response.ok) {
      throw new MysaApiError(response);
    }
    return response.json();
  }
  /**
   * Sets the state of a specific device by sending commands via MQTT.
   *
   * This method allows you to change the temperature set point and/or operating mode of a Mysa device. The command is
   * sent through the MQTT connection for real-time device control.
   *
   * @example
   *
   * ```typescript
   * // Set temperature to 22°C
   * await client.setDeviceState('device123', 22);
   *
   * // Turn device off
   * await client.setDeviceState('device123', undefined, 'off');
   *
   * // Set temperature and mode
   * await client.setDeviceState('device123', 20, 'heat');
   *
   * // Set fan speed
   * await client.setDeviceState('device123', undefined, undefined, 'auto');
   * ```
   *
   * @param deviceId - The ID of the device to control.
   * @param setPoint - The target temperature set point (optional).
   * @param mode - The operating mode to set (one of MysaDeviceMode values, or undefined to leave unchanged).
   * @param fanSpeed - The fan speed mode to set ('low', 'medium', 'high', 'max', 'auto', or undefined to leave
   *   unchanged).
   * @throws {@link UnauthenticatedError} When the user is not authenticated.
   * @throws {@link Error} When MQTT connection or command sending fails.
   */
  async setDeviceState(deviceId, setPoint, mode, fanSpeed) {
    var _a;
    this._logger.debug(`Setting device state for '${deviceId}'`);
    if (!this._cachedDevices) {
      this._cachedDevices = await this.getDevices();
    }
    const device = this._cachedDevices.DevicesObj[deviceId];
    this._logger.debug(`Initializing MQTT connection...`);
    const mqttConnection = await this._getMqttConnection();
    const now = dayjs();
    this._logger.debug(`Sending request to set device state for '${deviceId}'...`);
    const modeMap = { off: 1, auto: 2, heat: 3, cool: 4, fan_only: 5, dry: 6 };
    const fanSpeedMap = { auto: 1, low: 3, medium: 5, high: 7, max: 8 };
    const payload = serializeMqttPayload({
      msg: 44 /* CHANGE_DEVICE_STATE */,
      id: now.valueOf(),
      time: now.unix(),
      ver: "1.0",
      src: {
        ref: ((_a = this.session) == null ? void 0 : _a.username) ?? "",
        type: 100
      },
      dest: {
        ref: deviceId,
        type: 1
      },
      resp: 2,
      body: {
        ver: 1,
        type: device.Model.startsWith("BB-V1") ? 1 : device.Model.startsWith("AC-V1") ? 2 : device.Model.startsWith("BB-V2") ? device.Model.endsWith("-L") ? 5 : 4 : 0,
        cmd: [
          {
            tm: -1,
            sp: setPoint,
            md: mode ? modeMap[mode] : void 0,
            fn: fanSpeed ? fanSpeedMap[fanSpeed] : void 0
          }
        ]
      }
    });
    try {
      await this._publishWithRetry(mqttConnection, `/v1/dev/${deviceId}/in`, payload, mqtt.QoS.AtLeastOnce);
      this._logger.debug(`Device state publish succeeded for '${deviceId}'`);
    } catch (error) {
      this._logger.error(`Failed to set device state for '${deviceId}'`, error);
      throw error;
    }
  }
  /**
   * Starts receiving real-time updates for the specified device.
   *
   * This method establishes an MQTT subscription to receive live status updates from the device, including temperature,
   * humidity, set point changes, and other state information. The client will automatically send keep-alive messages to
   * maintain the connection.
   *
   * @example
   *
   * ```typescript
   * // Start receiving updates and listen for events
   * await client.startRealtimeUpdates('device123');
   *
   * client.emitter.on('statusChanged', (status) => {
   *   console.log(`Temperature: ${status.temperature}°C`);
   * });
   * ```
   *
   * @param deviceId - The ID of the device to start receiving updates for.
   * @throws {@link Error} When MQTT connection or subscription fails.
   */
  async startRealtimeUpdates(deviceId) {
    this._logger.info(`Starting real-time updates for device '${deviceId}'`);
    if (this._realtimeDeviceIds.has(deviceId)) {
      this._logger.debug(`Real-time updates for device '${deviceId}' already started`);
      return;
    }
    this._logger.debug(`Initializing MQTT connection...`);
    const mqttConnection = await this._getMqttConnection();
    this._logger.debug(`Subscribing to MQTT topic '/v1/dev/${deviceId}/out'...`);
    await mqttConnection.subscribe(`/v1/dev/${deviceId}/out`, mqtt.QoS.AtLeastOnce, (_, payload2) => {
      this._processMqttMessage(payload2);
    });
    this._logger.debug(`Sending request to start publishing device status for '${deviceId}'...`);
    const payload = serializeMqttPayload({
      Device: deviceId,
      MsgType: 11 /* START_PUBLISHING_DEVICE_STATUS */,
      Timestamp: dayjs().unix(),
      Timeout: RealtimeKeepAliveInterval.asSeconds()
    });
    await this._publishWithRetry(mqttConnection, `/v1/dev/${deviceId}/in`, payload, mqtt.QoS.AtLeastOnce);
    const timer = setInterval(async () => {
      this._logger.debug(`Sending request to keep-alive publishing device status for '${deviceId}'...`);
      const connection = await this._getMqttConnection();
      const payload2 = serializeMqttPayload({
        Device: deviceId,
        MsgType: 11 /* START_PUBLISHING_DEVICE_STATUS */,
        Timestamp: dayjs().unix(),
        Timeout: RealtimeKeepAliveInterval.asSeconds()
      });
      await this._publishWithRetry(connection, `/v1/dev/${deviceId}/in`, payload2, mqtt.QoS.AtLeastOnce);
    }, RealtimeKeepAliveInterval.subtract(10, "seconds").asMilliseconds());
    this._realtimeDeviceIds.set(deviceId, timer);
  }
  /**
   * Stops receiving real-time updates for the specified device.
   *
   * This method unsubscribes from the MQTT topic for the specified device and clears any associated timers to stop the
   * keep-alive messages.
   *
   * @param deviceId - The ID of the device to stop receiving real-time updates for.
   * @throws {@link Error} When MQTT unsubscription fails.
   */
  async stopRealtimeUpdates(deviceId) {
    this._logger.info(`Stopping real-time updates for device '${deviceId}'`);
    const timer = this._realtimeDeviceIds.get(deviceId);
    if (!timer) {
      this._logger.warn(`No real-time updates are running for device '${deviceId}'`);
      return;
    }
    this._logger.debug(`Initializing MQTT connection...`);
    const mqttConnection = await this._getMqttConnection();
    this._logger.debug(`Unsubscribing to MQTT topic '/v1/dev/${deviceId}/out'...`);
    await mqttConnection.unsubscribe(`/v1/dev/${deviceId}/out`);
    clearInterval(timer);
    this._realtimeDeviceIds.delete(deviceId);
  }
  /**
   * Ensures a valid, non-expired session is available.
   *
   * This method checks if the current session is valid and not expired. If the session is expired, it automatically
   * refreshes it using the refresh token.
   *
   * @returns A promise that resolves to a valid CognitoUserSession.
   * @throws {@link UnauthenticatedError} When no session exists or refresh fails.
   */
  async _getFreshSession() {
    if (!this._cognitoUser || !this._cognitoUserSession) {
      throw new UnauthenticatedError("An attempt was made to access a resource without a valid session.");
    }
    if (this._cognitoUserSession.isValid() && dayjs.unix(this._cognitoUserSession.getIdToken().getExpiration()).isAfter()) {
      this._logger.debug("Session is valid, no need to refresh");
      return Promise.resolve(this._cognitoUserSession);
    }
    this._logger.debug("Session is not valid or expired, refreshing...");
    return new Promise((resolve, reject) => {
      this._cognitoUser.refreshSession(this._cognitoUserSession.getRefreshToken(), (error, session) => {
        if (error) {
          this._logger.error("Failed to refresh session:", error);
          reject(new UnauthenticatedError("Unable to refresh the authentication session."));
        } else {
          this._logger.debug("Session refreshed successfully");
          this._cognitoUserSession = session;
          this.emitter.emit("sessionChanged", this.session);
          resolve(session);
        }
      });
    });
  }
  /**
   * Establishes and returns an MQTT connection for real-time communication.
   *
   * This method creates a new MQTT connection if one doesn't exist, using AWS IoT WebSocket connections with Cognito
   * credentials. The connection is cached and reused for subsequent calls.
   *
   * @returns A promise that resolves to an active MQTT connection.
   * @throws {@link Error} When connection establishment fails.
   */
  _getMqttConnection() {
    if (!this._mqttConnectionPromise) {
      this._mqttConnectionPromise = this._createMqttConnection().catch((err) => {
        this._mqttConnectionPromise = void 0;
        throw err;
      });
    }
    return this._mqttConnectionPromise;
  }
  /**
   * Determines whether an MQTT-related error is considered transient and worth retrying.
   *
   * Transient errors include timeouts, cancelled operations due to clean sessions, temporary connectivity loss, and
   * other recoverable network issues. Fatal errors (auth, permission, configuration) should not be retried at this
   * layer.
   *
   * @param err - The error object thrown by the underlying MQTT operation.
   * @returns True if the error appears transient and a retry should be attempted; false otherwise.
   */
  _isTransientMqttError(err) {
    if (!err || typeof err !== "object") {
      return false;
    }
    const anyErr = err;
    const code = anyErr.error_code || anyErr.error_name || anyErr.error;
    const msg = (anyErr.message || anyErr.error || "").toString();
    const transientMarkers = [
      "AWS_ERROR_MQTT_TIMEOUT",
      "AWS_ERROR_MQTT_NO_CONNECTION",
      "AWS_ERROR_MQTT_UNEXPECTED_HANGUP",
      "UNEXPECTED_HANGUP",
      "AWS_ERROR_MQTT_CONNECTION_DESTROYED",
      "Time limit between request and response",
      "timeout"
    ];
    return transientMarkers.some((m) => code && String(code).includes(m) || msg.includes(m));
  }
  /**
   * Publishes an MQTT message with exponential backoff retries for transient failures.
   *
   * Retries occur for errors classified by `_isTransientMqttError`. Between attempts the delay grows exponentially with
   * jitter to avoid thundering herds after broker recovery. If the connection is not currently marked as connected, a
   * reconnect is attempted; if that fails, the connection is rebuilt (fresh credentials) before the next retry.
   *
   * On final failure (after maxAttempts) a {@link MqttPublishError} is thrown including the number of attempts and
   * original error for higher-level handling.
   *
   * @remarks
   * Retry options fields:
   *
   * - MaxAttempts: Maximum number of publish attempts before failing (default: 5).
   * - BaseDelayMs: Base delay in milliseconds used for exponential backoff calculation (default: 500).
   *
   * @param connection - The active MQTT client connection used to send the publish.
   * @param topic - The MQTT topic to publish to.
   * @param payload - The serialized payload (binary buffer or Uint8Array).
   * @param qos - The desired MQTT QoS level for the publish.
   * @param opts - Retry options (defaults: maxAttempts=5, baseDelayMs=500).
   * @returns A promise that resolves when the publish succeeds, or rejects with {@link MqttPublishError}.
   */
  async _publishWithRetry(connection, topic, payload, qos, opts = {}) {
    const maxAttempts = opts.maxAttempts ?? 5;
    const baseDelayMs = opts.baseDelayMs ?? 500;
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        await connection.publish(topic, payload, qos);
        return;
      } catch (err) {
        const isTransient = this._isTransientMqttError(err);
        if (!isTransient || attempt >= maxAttempts) {
          throw new MqttPublishError(`MQTT publish failed after ${attempt} attempts`, attempt, err);
        }
        const JITTER_MIN_FACTOR = 0.75;
        const JITTER_RANGE = 0.5;
        const delay = baseDelayMs * Math.pow(2, attempt - 1) * (JITTER_MIN_FACTOR + Math.random() * JITTER_RANGE);
        this._logger.warn(
          `Transient MQTT publish error on '${topic}' (attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(
            delay
          )}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  /**
   * Creates a new MQTT connection using AWS IoT WebSocket connections with Cognito credentials.
   *
   * @returns A promise that resolves to an active MQTT connection.
   * @throws {@link Error} When connection establishment fails.
   */
  async _createMqttConnection() {
    var _a;
    const session = await this._getFreshSession();
    const credentialsProvider = fromCognitoIdentityPool({
      clientConfig: {
        region: AwsRegion
      },
      identityPoolId: CognitoIdentityPoolId,
      logins: {
        [CognitoLoginKey]: session.getIdToken().getJwtToken()
      },
      logger: this._logger
    });
    const credentials = await credentialsProvider();
    if (!credentials.expiration) {
      throw new Error("MQTT credentials do not have an expiration time.");
    }
    this._mqttCredentialsExpiration = dayjs(credentials.expiration);
    this._logger.debug(`MQTT credentials expiration: ${this._mqttCredentialsExpiration.format()}`);
    if (!this._mqttCredentialsExpiration.isAfter(dayjs())) {
      this._mqttCredentialsExpiration = void 0;
      throw new Error("MQTT credentials are already expired.");
    }
    if (!this._mqttClientId) {
      const username = ((_a = this.session) == null ? void 0 : _a.username) ?? "anon";
      const usernameHash = hash("sha1", username);
      this._mqttClientId = `mysa-js-sdk-${usernameHash}-${process.pid}-${getRandomClientId()}`;
    }
    const builder = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets().with_credentials(AwsRegion, credentials.accessKeyId, credentials.secretAccessKey, credentials.sessionToken).with_endpoint(MqttEndpoint).with_client_id(this._mqttClientId).with_clean_session(false).with_keep_alive_seconds(30).with_ping_timeout_ms(3e3).with_protocol_operation_timeout_ms(6e4).with_reconnect_min_sec(1).with_reconnect_max_sec(30);
    const config = builder.build();
    const client = new mqtt.MqttClient();
    const connection = client.new_connection(config);
    connection.on("connect", () => {
      this._logger.debug(`MQTT connect (clientId=${this._mqttClientId})`);
    });
    connection.on("connection_success", () => {
      this._logger.debug(`MQTT connection_success (clientId=${this._mqttClientId})`);
    });
    connection.on("connection_failure", (e) => {
      this._logger.error(`MQTT connection_failure (clientId=${this._mqttClientId})`, e);
    });
    connection.on("interrupt", async (e) => {
      var _a2;
      this._logger.warn(`MQTT interrupt (clientId=${this._mqttClientId})`, e);
      const now = Date.now();
      this._mqttInterrupts = this._mqttInterrupts.filter((t) => now - t < 6e4);
      this._mqttInterrupts.push(now);
      const areCredentialsExpired = !(((_a2 = this._mqttCredentialsExpiration) == null ? void 0 : _a2.isAfter(dayjs())) ?? false);
      if ((this._mqttInterrupts.length > 5 || areCredentialsExpired) && !this._mqttResetInProgress) {
        this._mqttResetInProgress = true;
        if (this._mqttInterrupts.length > 5) {
          this._logger.warn(
            `High interrupt rate (${this._mqttInterrupts.length}/60s). Possible clientId collision. Regenerating clientId and resetting connection...`
          );
        } else {
          this._logger.warn(`Credentials expired. Regenerating clientId and resetting connection...`);
        }
        this._mqttClientId = void 0;
        this._mqttCredentialsExpiration = void 0;
        this._mqttInterrupts = [];
        this._mqttConnectionPromise = void 0;
        try {
          await connection.disconnect();
          try {
            this._logger.debug("Old MQTT connection disconnected; establishing new connection...");
            const newConnection = await this._getMqttConnection();
            for (const deviceId of Array.from(this._realtimeDeviceIds.keys())) {
              const topic = `/v1/dev/${deviceId}/out`;
              this._logger.debug(`Re-subscribing to ${topic}`);
              await newConnection.subscribe(topic, mqtt.QoS.AtLeastOnce, (_topic, payload) => {
                this._processMqttMessage(payload);
              });
            }
            this._logger.info("MQTT connection rebuilt successfully after interrupt storm or credentials expiration");
          } catch (err) {
            this._logger.error("Failed to re-subscribe after interrupt storm or credentials expiration", err);
          }
        } catch (error) {
          this._logger.error("Error during MQTT reset", error);
        } finally {
          this._mqttResetInProgress = false;
        }
      }
    });
    connection.on("resume", async (returnCode, sessionPresent) => {
      this._logger.info(
        `MQTT resume returnCode=${returnCode} sessionPresent=${sessionPresent} clientId=${this._mqttClientId}`
      );
      if (!sessionPresent) {
        this._logger.info("No session present, re-subscribing each device");
        try {
          for (const deviceId of Array.from(this._realtimeDeviceIds.keys())) {
            const topic = `/v1/dev/${deviceId}/out`;
            this._logger.debug(`Re-subscribing to ${topic}`);
            await connection.subscribe(topic, mqtt.QoS.AtLeastOnce, (_topic, payload) => {
              this._processMqttMessage(payload);
            });
          }
        } catch (err) {
          this._logger.error("Failed to re-subscribe after resume", err);
        }
      }
    });
    connection.on("error", (e) => {
      this._logger.error(`MQTT error (clientId=${this._mqttClientId})`, e);
    });
    connection.on("closed", () => {
      this._logger.info("MQTT connection closed");
      this._mqttConnectionPromise = void 0;
      this._mqttCredentialsExpiration = void 0;
    });
    await connection.connect();
    return connection;
  }
  /**
   * Processes incoming MQTT messages and emits appropriate events.
   *
   * This method parses MQTT payloads and converts them into typed events that can be listened to via the client's event
   * emitter. It handles both v1 and v2 device message formats and emits events like 'statusChanged', 'setPointChanged',
   * and 'stateChanged'.
   *
   * @param payload - The raw MQTT message payload to process.
   */
  _processMqttMessage(payload) {
    try {
      const parsedPayload = parseMqttPayload(payload);
      this.emitter.emit("rawRealtimeMessageReceived", parsedPayload);
      if (isMsgTypeOutPayload(parsedPayload)) {
        switch (parsedPayload.MsgType) {
          case 0 /* DEVICE_V1_STATUS */:
            this.emitter.emit("statusChanged", {
              deviceId: parsedPayload.Device,
              temperature: parsedPayload.MainTemp,
              humidity: parsedPayload.Humidity,
              setPoint: parsedPayload.SetPoint,
              current: parsedPayload.Current
            });
            break;
          case 1 /* DEVICE_SETPOINT_CHANGE */:
            this.emitter.emit("setPointChanged", {
              deviceId: parsedPayload.Device,
              newSetPoint: parsedPayload.Next,
              previousSetPoint: parsedPayload.Prev
            });
            break;
        }
      } else if (isMsgOutPayload(parsedPayload)) {
        switch (parsedPayload.msg) {
          case 40 /* DEVICE_V2_STATUS */:
            this.emitter.emit("statusChanged", {
              deviceId: parsedPayload.src.ref,
              temperature: parsedPayload.body.ambTemp,
              humidity: parsedPayload.body.hum,
              setPoint: parsedPayload.body.stpt,
              dutyCycle: parsedPayload.body.dtyCycle
            });
            break;
          case 44 /* DEVICE_STATE_CHANGE */: {
            const modeMap = {
              1: "off",
              2: "auto",
              3: "heat",
              4: "cool",
              5: "fan_only",
              6: "dry"
            };
            const fanSpeedMap = {
              1: "auto",
              3: "low",
              5: "medium",
              7: "high",
              8: "max"
            };
            this.emitter.emit("stateChanged", {
              deviceId: parsedPayload.src.ref,
              mode: parsedPayload.body.state.md ? modeMap[parsedPayload.body.state.md] : void 0,
              setPoint: parsedPayload.body.state.sp,
              fanSpeed: parsedPayload.body.state.fn !== void 0 ? fanSpeedMap[parsedPayload.body.state.fn] : void 0
            });
            break;
          }
        }
      }
    } catch (error) {
      this._logger.error("Error handling MQTT message:", error);
    }
  }
};
export {
  InMessageType,
  MqttPublishError,
  MysaApiClient,
  MysaApiError,
  OutMessageType,
  UnauthenticatedError,
  VoidLogger
};
//# sourceMappingURL=index.js.map