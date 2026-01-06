/** Error thrown when attempting to access the Mysa API without proper authentication. */
declare class UnauthenticatedError extends Error {
    /**
     * Creates a new UnauthenticatedError instance.
     *
     * @param message - The error message
     */
    constructor(message: string);
}
/** Error thrown when a Mysa API request fails. */
declare class MysaApiError extends Error {
    /** The HTTP status code returned by the API */
    readonly status: number;
    /** The HTTP status text returned by the API */
    readonly statusText: string;
    /**
     * Creates a new MysaApiError instance.
     *
     * @param apiResponse - The failed Response object from the API call
     */
    constructor(apiResponse: Response);
}
/** Error thrown when an MQTT publish ultimately fails after retry attempts. */
declare class MqttPublishError extends Error {
    attempts: number;
    original?: unknown | undefined;
    /**
     * Creates a new MqttPublishError instance.
     *
     * @param message - A human-readable description of the publish failure.
     * @param attempts - The number of attempts that were made before giving up.
     * @param original - The original error object thrown by the underlying MQTT library (optional).
     */
    constructor(message: string, attempts: number, original?: unknown | undefined);
}

/**
 * Interface representing a temperature setpoint change event for a Mysa device.
 *
 * This event is emitted when a device's target temperature setting is modified, providing both the previous and new
 * setpoint values for tracking and logging purposes. The change may be initiated by user interaction, scheduling, or
 * programmatic control through the API.
 */
interface SetPointChange {
    /** Unique identifier of the device whose setpoint was changed */
    deviceId: string;
    /** The new temperature setpoint value after the change */
    newSetPoint: number;
    /** The previous temperature setpoint value before the change */
    previousSetPoint: number;
}

/**
 * Union type representing the available operating modes for Mysa devices.
 *
 * Defines the possible operational states that a Mysa thermostat or heating device can be set to. These modes control
 * the device's heating behavior and power consumption.
 */
type MysaDeviceMode = 'off' | 'heat' | 'cool' | 'dry' | 'fan_only' | 'auto';
/**
 * Union type representing the available fan speed modes for Mysa devices.
 *
 * Defines the possible fan speed states that a Mysa thermostat device can be set to.
 */
type MysaFanSpeedMode = 'auto' | 'low' | 'medium' | 'high' | 'max';

/**
 * Interface representing a device state change event for a Mysa device.
 *
 * This event is emitted when a device's operational parameters are modified, such as changing the operating mode or
 * temperature setpoint. State changes can be initiated through user interaction, scheduling, or programmatic control
 * through the API.
 */
interface StateChange {
    /** Unique identifier of the device whose state was changed */
    deviceId: string;
    /** The device's operating mode (e.g., 'heat', 'off'), if available */
    mode?: MysaDeviceMode;
    /** Current temperature setpoint after the state change */
    setPoint: number;
    /** Optional fan speed (1 = auto, 3 = low, 5 = medium, 7 = high, 8 = max). AC only */
    fanSpeed?: MysaFanSpeedMode;
}

/**
 * Interface representing the current status of a Mysa device.
 *
 * Contains real-time operational data and measurements from the device, including environmental readings and electrical
 * parameters. This data is typically received through status update events from the device.
 */
interface Status {
    /** Unique identifier of the device reporting this status */
    deviceId: string;
    /** Current ambient temperature reading from the device sensor */
    temperature: number;
    /** Current relative humidity percentage reading from the device sensor */
    humidity: number;
    /** Current temperature setpoint setting */
    setPoint: number;
    /** Optional electrical current draw measurement in amperes */
    current?: number;
    /** Optional heating element duty cycle as a percentage (0-100) */
    dutyCycle?: number;
}

/** Interface for logging operations at different severity levels */
interface Logger {
    /** Logs a debug message with optional metadata */
    debug(message: string, ...meta: unknown[]): void;
    /** Logs an info message with optional metadata */
    info(message: string, ...meta: unknown[]): void;
    /** Logs a warning message with optional metadata */
    warn(message: string, ...meta: unknown[]): void;
    /** Logs an error message with optional metadata */
    error(message: string, ...meta: unknown[]): void;
}
/** Logger implementation that silently discards all log messages. */
declare class VoidLogger implements Logger {
    debug(message: string, ...meta: unknown[]): void;
    info(message: string, ...meta: unknown[]): void;
    warn(message: string, ...meta: unknown[]): void;
    error(message: string, ...meta: unknown[]): void;
}

/**
 * Interface representing an authenticated Mysa user session.
 *
 * Contains the authentication tokens and user information required to make authorized API calls to the Mysa service.
 * These tokens are typically obtained through the login process and used for subsequent API requests.
 */
interface MysaSession {
    /** The username/email address of the authenticated user */
    username: string;
    /** JWT identity token containing user identity information */
    idToken: string;
    /** JWT access token used for authorizing API requests */
    accessToken: string;
    /** JWT refresh token used to obtain new access tokens when they expire */
    refreshToken: string;
}

/**
 * Typed wrapper around Node's `EventEmitter` class.
 *
 * @remarks
 * Source: {@link https://blog.makerx.com.au/a-type-safe-event-emitter-in-node-js}
 */
declare class EventEmitter<TEvents extends Record<string, any>> implements NodeJS.EventEmitter {
    private _emitter;
    emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): boolean;
    on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this;
    once<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this;
    off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this;
    addListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: TEvents[TEventName]) => void): this;
    removeListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: TEvents[TEventName]) => void): this;
    removeAllListeners<TEventName extends keyof TEvents & string>(eventName?: TEventName | undefined): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners<TEventName extends keyof TEvents & string>(eventName: TEventName): Function[];
    rawListeners<TEventName extends keyof TEvents & string>(eventName: TEventName): Function[];
    listenerCount<TEventName extends keyof TEvents & string>(eventName: TEventName, listener?: (...args: TEvents[TEventName]) => void): number;
    prependListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: TEvents[TEventName]) => void): this;
    prependOnceListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: TEvents[TEventName]) => void): this;
    eventNames(): (string | symbol)[];
}

/**
 * Brand information for air conditioning devices.
 *
 * Contains manufacturer and model details for AC units that are controlled through the Mysa system, including both
 * brand and OEM information.
 */
interface BrandInfo {
    /** The brand name of the AC device */
    Brand: string;
    /** Unique identifier for the brand */
    Id: number;
    /** Remote control model number for the AC device */
    remoteModelNumber?: string;
    /** Original Equipment Manufacturer brand name */
    OEMBrand?: string;
}
/**
 * Supported capabilities and features for air conditioning devices.
 *
 * Defines the operational parameters and available functions for AC units, including temperature ranges, operating
 * modes, and supported control keys.
 */
interface SupportedCaps {
    /** Temperature range as [minimum, maximum] in device units */
    tempRange: [number, number];
    /** Available operating modes with their supported temperature settings */
    modes: {
        [modeId: string]: {
            /** Array of available temperature setpoints for this mode */
            temperatures: number[];
        };
    };
    /** Version string of the capability definition */
    version: string;
    /** Array of supported remote control key codes */
    keys: number[];
}
/**
 * Device operating mode information.
 *
 * Represents the current or available operating mode for a device, identified by a numeric mode identifier.
 */
interface ModeObj {
    /** Numeric identifier for the device operating mode */
    Id: number;
}
/**
 * Base interface for all Mysa device types.
 *
 * Defines the common properties and configuration parameters shared across different types of Mysa devices, including
 * thermostats, switches, and AC controllers. This interface encompasses both required core properties and optional
 * features that may vary depending on the specific device model and capabilities.
 */
interface DeviceBase {
    /** Button digital input configuration value */
    ButtonDI?: number;
    /** Maximum current rating as a string value */
    MaxCurrent?: string;
    /** Device model identifier string */
    Model: string;
    /** Button average value configuration */
    ButtonAVE?: number;
    /** Operating voltage of the device */
    Voltage?: number;
    /** Button polling interval configuration */
    ButtonPolling?: number;
    /** Minimum brightness level (0-100) */
    MinBrightness?: number;
    /** User-assigned device name */
    Name?: string;
    /** Button low power mode configuration */
    ButtonLowPower?: number;
    /** Type of heater controlled by the device */
    HeaterType?: string;
    /** Button repeat delay configuration in milliseconds */
    ButtonRepeatDelay?: number;
    /** Button repeat start delay configuration in milliseconds */
    ButtonRepeatStart?: number;
    /** Display animation style setting */
    Animation?: string;
    /** Maximum brightness level (0-100) */
    MaxBrightness?: number;
    /** Array of user IDs allowed to control this device */
    AllowedUsers?: string[];
    /** Current button state indicator */
    ButtonState?: string;
    /** Home identifier that this device belongs to */
    Home?: string;
    /** Button sensitivity threshold configuration */
    ButtonThreshold?: number;
    /** Data format version used by the device */
    Format?: string;
    /** Time zone setting for the device */
    TimeZone?: string;
    /** Unix timestamp of when device was last paired */
    LastPaired?: number;
    /** Minimum temperature setpoint allowed */
    MinSetpoint?: number;
    /** Current operating mode of the device */
    Mode?: ModeObj;
    /** User ID of the device owner */
    Owner?: string;
    /** Maximum temperature setpoint allowed */
    MaxSetpoint?: number;
    /** Unique device identifier */
    Id: string;
    /** Optional zone assignment for the device */
    Zone?: string;
    /** Optional measured voltage reading from the device */
    MeasuredVoltage?: number;
    /** Optional duty cycle optimization setting */
    DutyCycleOpt?: number;
    /** Optional eco mode configuration */
    ecoMode?: number;
    /** Optional flag indicating if device has thermostatic control */
    IsThermostatic?: boolean;
    /** Optional flag indicating if device requires setup */
    SetupRequired?: boolean;
    /** Optional brand information for AC devices */
    Brand?: BrandInfo;
    /** Optional supported capabilities for AC devices */
    SupportedCaps?: SupportedCaps;
    /** Optional device code number */
    CodeNum?: number;
}
/**
 * Collection of devices indexed by their unique identifiers.
 *
 * Maps device ID strings to their corresponding device configuration objects, providing a lookup table for all devices
 * associated with a user account.
 */
interface DevicesObj {
    /** Device objects indexed by their unique device ID strings */
    [deviceId: string]: DeviceBase;
}
/**
 * Top-level interface for the devices REST API response.
 *
 * Contains the complete collection of devices associated with a user account, typically returned from API endpoints
 * that fetch device information.
 */
interface Devices {
    /** Collection of all devices indexed by their unique identifiers */
    DevicesObj: DevicesObj;
}

/** Device firmware information */
interface FirmwareDevice {
    /** Device ID */
    Device: string;
    /** Device firmware version */
    InstalledVersion: string;
}
/**
 * Collection of firmware devices indexed by device ID
 *
 * Maps device ID strings to their corresponding firmware device objects, providing a lookup table for all devices
 * associated with a user account.
 */
interface Firmwares {
    Firmware: Record<string, FirmwareDevice>;
}

/** Represents a timestamped value with metadata */
interface TimestampedValue<T = number> {
    /** Timestamp when the value was recorded */
    t: number;
    /** The actual value */
    v: T;
}
/** Represents the state of a single device */
interface DeviceState {
    /** Device identifier */
    Device: string;
    /** Overall timestamp for the device state */
    Timestamp: number;
    /** Time the device has been on */
    OnTime?: TimestampedValue<number>;
    /** Temperature set point */
    SetPoint?: TimestampedValue<number>;
    /** Display brightness level */
    Brightness?: TimestampedValue<number>;
    /** Schedule mode setting */
    ScheduleMode?: TimestampedValue<number>;
    /** Hold time setting */
    HoldTime?: TimestampedValue<number>;
    /** Wi-Fi signal strength */
    Rssi?: TimestampedValue<number>;
    /** Thermostat mode */
    TstatMode?: TimestampedValue<number>;
    /** Available heap memory */
    FreeHeap?: TimestampedValue<number>;
    /** Sensor temperature reading */
    SensorTemp?: TimestampedValue<number>;
    /** Current mode */
    Mode?: TimestampedValue<number>;
    /** Voltage measurement */
    Voltage?: TimestampedValue<number>;
    /** Temperature corrected for calibration */
    CorrectedTemp?: TimestampedValue<number>;
    /** Duty cycle percentage */
    Duty?: TimestampedValue<number>;
    /** Heat sink temperature */
    HeatSink?: TimestampedValue<number>;
    /** Time the device has been off */
    OffTime?: TimestampedValue<number>;
    /** Connection status */
    Connected?: TimestampedValue<boolean>;
    /** Current consumption */
    Current?: TimestampedValue<number>;
    /** Humidity reading */
    Humidity?: TimestampedValue<number>;
    /** Lock status */
    Lock?: TimestampedValue<number>;
    /** Fan speed */
    FanSpeed?: TimestampedValue<number>;
}
/**
 * Collection of device states indexed by device ID
 *
 * Maps device ID strings to their corresponding device state objects, providing a lookup table for all devices
 * associated with a user account.
 */
interface DeviceStatesObj {
    /** Device state objects indexed by their unique device ID strings */
    [deviceId: string]: DeviceState;
}
/** Top-level interface for the device states REST API response. */
interface DeviceStates {
    DeviceStatesObj: DeviceStatesObj;
}

/**
 * Base interface for all MQTT message payloads.
 *
 * This interface defines the common structure that all MQTT messages must contain, providing essential metadata for
 * message handling.
 */
interface MsgBasePayload {
    /** The message type identifier */
    msg: number;
    /** Unix timestamp when the message was created */
    time: number;
    /** Version string of the message format */
    ver: string;
    /** Unique identifier for the device or message source */
    id: number;
}
/**
 * Generic typed message payload interface.
 *
 * Extends the base payload with a strongly-typed message identifier, ensuring type safety for specific message types.
 *
 * @typeParam T - The specific message type number
 */
interface MsgPayload<T extends number> extends MsgBasePayload {
    /** The strongly-typed message type identifier */
    msg: T;
}

/**
 * Enumeration of message types for outgoing MQTT messages from devices to clients.
 *
 * These message types identify different kinds of status updates, notifications, and data reports that Mysa devices can
 * send via MQTT. The enum values correspond to specific numeric identifiers used in the MQTT protocol.
 */
declare enum OutMessageType {
    /** Version 1 device status report with basic device information */
    DEVICE_V1_STATUS = 0,
    /** Notification that a device's temperature setpoint has been changed */
    DEVICE_SETPOINT_CHANGE = 1,
    /** Device log entry or diagnostic information */
    DEVICE_LOG = 4,
    /** Notification sent when a device completes its boot sequence */
    DEVICE_POST_BOOT = 10,
    /** Version 2 device status report with enhanced device information */
    DEVICE_V2_STATUS = 40,
    /** Notification that a device's operational state has changed */
    DEVICE_STATE_CHANGE = 44
}

/**
 * Interface representing a device state change notification from a Mysa device.
 *
 * This message is sent when a device's operational state has been modified, either through user interaction, scheduled
 * changes, or external commands. It provides confirmation of the change and the resulting device state.
 */
interface DeviceStateChange extends MsgPayload<OutMessageType.DEVICE_STATE_CHANGE> {
    /** Source information identifying the device that changed state */
    src: {
        /** Reference identifier for the device */
        ref: string;
        /** Type identifier for the source device */
        type: number;
    };
    /** State change data payload containing the new device state and change metadata */
    body: {
        /** Current device state parameters after the change */
        state: {
            /** Brightness level (0-100) */
            br: number;
            /** Unknown */
            ho: number;
            /** Unknown */
            lk: number;
            /** Device mode (1 = OFF, 2 = AUTO, 3 = HEAT, 4 = COOL, 5 = FAN_ONLY, 6 = DRY) */
            md: number;
            /** Temperature setpoint */
            sp: number;
            /** Optional fan speed (1 = auto, 3 = low, 5 = medium, 7 = high, 8 = max). AC only */
            fn?: number;
        };
        /** Success indicator for the state change operation (1 = success, 0 = failure) */
        success: number;
        /** Trigger source identifier indicating what initiated the state change */
        trig_src: number;
        /** State change type identifier */
        type: number;
    };
}

/**
 * Interface representing a version 2 device status report from a Mysa device.
 *
 * This enhanced status message provides comprehensive information about the device's current operational state,
 * including environmental readings and system parameters. Version 2 status reports include additional data compared to
 * version 1 reports.
 */
interface DeviceV2Status extends MsgPayload<OutMessageType.DEVICE_V2_STATUS> {
    /** Source information identifying the device sending the status */
    src: {
        /** Reference identifier for the device */
        ref: string;
        /** Type identifier for the source device */
        type: number;
    };
    /** Status data payload containing current device measurements and settings */
    body: {
        /** Ambient temperature reading from the device sensor */
        ambTemp: number;
        /** Current duty cycle percentage of the heating element */
        dtyCycle: number;
        /** Relative humidity percentage reading from the device sensor */
        hum: number;
        /** Current temperature setpoint setting */
        stpt: number;
    };
}

/**
 * Union type representing all possible outgoing message-based MQTT payloads.
 *
 * This type encompasses payloads where the message type is specified in the `msg` field rather than the `MsgType`
 * field. Includes device status reports and state change notifications.
 */
type MsgOutPayload = DeviceV2Status | DeviceStateChange;

/**
 * Base interface for MQTT message payloads that use the MsgType field.
 *
 * This interface defines the common structure for MQTT messages where the message type is specified in the `MsgType`
 * field rather than the `msg` field. These are typically older message formats or specific device communications.
 */
interface MsgTypeBasePayload {
    /** The message type identifier */
    MsgType: number;
    /** Unix timestamp when the message was created */
    Timestamp: number;
    /** Device identifier string */
    Device: string;
}
/**
 * Generic typed message payload interface for MsgType-based messages.
 *
 * Extends the base MsgType payload with a strongly-typed message identifier, ensuring type safety for specific message
 * types that use the MsgType field.
 *
 * @typeParam T - The specific message type number
 */
interface MsgTypePayload<T extends number> extends MsgTypeBasePayload {
    /** The strongly-typed message type identifier */
    MsgType: T;
}

/**
 * Interface representing a device log entry from a Mysa device.
 *
 * This message contains diagnostic information, error reports, or general logging data from the device. Log entries
 * include a severity level and a descriptive message for debugging and monitoring purposes.
 */
interface DeviceLog extends MsgTypePayload<OutMessageType.DEVICE_LOG> {
    /** Log severity level (e.g., "INFO", "WARN", "ERROR", "DEBUG") */
    Level: string;
    /** Descriptive log message containing the actual log content */
    Message: string;
}

/**
 * Interface representing a device post-boot notification from a Mysa device.
 *
 * This message is sent when a device has completed its boot sequence and is ready for normal operation. It serves as a
 * signal that the device has successfully initialized and is available for commands and status requests.
 */
interface DevicePostBoot extends MsgTypePayload<OutMessageType.DEVICE_POST_BOOT> {
}

/**
 * Interface representing a device setpoint change notification from a Mysa device.
 *
 * This message is sent when a device's temperature setpoint has been modified, providing information about the source
 * of the change and both the previous and new setpoint values for tracking and logging purposes.
 */
interface DeviceSetpointChange extends MsgTypePayload<OutMessageType.DEVICE_SETPOINT_CHANGE> {
    /** Source identifier indicating what initiated the setpoint change (user, schedule, etc.) */
    Source: number;
    /** Previous temperature setpoint value before the change */
    Prev: number;
    /** New temperature setpoint value after the change */
    Next: number;
}

/**
 * Interface representing a version 1 device status report from a Mysa device.
 *
 * This legacy status message format provides basic operational information about the device's current state, including
 * temperature readings, electrical parameters, and configuration settings. Version 1 status reports use the MsgType
 * field format.
 */
interface DeviceV1Status extends MsgTypePayload<OutMessageType.DEVICE_V1_STATUS> {
    /** Main temperature sensor reading */
    MainTemp: number;
    /** Thermistor temperature sensor reading */
    ThermistorTemp: number;
    /** Combined/calculated temperature reading */
    ComboTemp: number;
    /** Relative humidity percentage reading */
    Humidity: number;
    /** Current electrical current draw in amperes */
    Current: number;
    /** Current temperature setpoint setting */
    SetPoint: number;
    /** Data stream identifier or status */
    Stream: number;
}

/**
 * Union type representing all possible outgoing MsgType-based MQTT payloads.
 *
 * This type encompasses payloads where the message type is specified in the `MsgType` field rather than the `msg`
 * field. These include legacy device status reports, configuration change notifications, diagnostic logs, and system
 * events that use the older message format.
 */
type MsgTypeOutPayload = DeviceV1Status | DeviceSetpointChange | DeviceLog | DevicePostBoot;

/**
 * Union type representing all possible outgoing MQTT payload types.
 *
 * This type encompasses both message type-based payloads and message-based payloads that can be sent from Mysa devices
 * via MQTT.
 */
type OutPayload = MsgTypeOutPayload | MsgOutPayload;

/**
 * Defines the event types and their parameters for the MysaApiClient.
 *
 * This type maps event names to their corresponding parameter arrays, providing type safety for event subscription and
 * emission in the Mysa API client's event system.
 */
type MysaApiClientEventTypes = {
    /**
     * Event emitted when the session changes.
     *
     * @remarks
     * You should subscribe to this event and persist the session object whenever it changes.
     * @param session - The new session object or undefined if session was cleared.
     */
    sessionChanged: [session: MysaSession | undefined];
    /**
     * Event emitted when a device's status information is updated.
     *
     * This event provides comprehensive status information including temperature readings, operational state, and device
     * health data.
     *
     * @param status - The updated device status information
     */
    statusChanged: [status: Status];
    /**
     * Event emitted when a device's temperature setpoint is changed.
     *
     * This event is triggered when the target temperature for a device is modified, either through user interaction or
     * programmatic control.
     *
     * @param change - Details about the setpoint change including old and new values
     */
    setPointChanged: [change: SetPointChange];
    /**
     * Event emitted when a device's operational state changes.
     *
     * This event is triggered when device parameters such as mode, brightness, or other operational settings are
     * modified.
     *
     * @param change - Details about the state change including affected parameters
     */
    stateChanged: [change: StateChange];
    /**
     * Event emitted when a raw MQTT message is received from devices.
     *
     * This low-level event provides access to the unprocessed MQTT payload for advanced use cases that require direct
     * access to the raw device data.
     *
     * @param message - The raw outgoing MQTT payload from the device
     */
    rawRealtimeMessageReceived: [message: OutPayload];
};

/** Configuration options for the Mysa API client. */
interface MysaApiClientOptions {
    /**
     * Optional logger instance for client logging.
     *
     * @defaultValue A _void_ logger instance that does nothing.
     */
    logger?: Logger;
    /**
     * Optional fetch function to use for HTTP requests.
     *
     * @defaultValue The global `fetch` function.
     */
    fetcher?: typeof fetch;
}

/** Options for MQTT publish operations. */
interface MqttPublishOptions {
    /** Maximum number of publish attempts before failing (default: 5). */
    maxAttempts?: number;
    /** Base delay in milliseconds used for exponential backoff calculation (default: 500). */
    baseDelayMs?: number;
}
/**
 * Main client for interacting with the Mysa API and real-time device communication.
 *
 * The MysaApiClient provides a comprehensive interface for authenticating with Mysa services, managing device data, and
 * receiving real-time updates from Mysa thermostats and heating devices. It handles both REST API calls for device
 * management and MQTT connections for live status updates and control commands.
 *
 * @example
 *
 * ```typescript
 * const client = new MysaApiClient();
 *
 * await client.login('user@example.com', 'password');
 * const devices = await client.getDevices();
 *
 * client.emitter.on('statusChanged', (status) => {
 *   console.log(`Device ${status.deviceId} temperature: ${status.temperature}°C`);
 * });
 *
 * for (const device of Object.entries(devices.DevicesObj)) {
 *   await client.startRealtimeUpdates(device[0]);
 * }
 * ```
 */
declare class MysaApiClient {
    /** The current session object, if any. */
    private _cognitoUserSession?;
    /** The current user object, if any. */
    private _cognitoUser?;
    /** The logger instance used by the client. */
    private _logger;
    /** The fetcher function used by the client. */
    private _fetcher;
    /** A promise that resolves to the MQTT connection used for real-time updates. */
    private _mqttConnectionPromise?;
    /** Stable per-process MQTT client id (prevents collisions between multiple processes). */
    private _mqttClientId?;
    /** Expiration time of the credentials currently in use by the MQTT client. */
    private _mqttCredentialsExpiration?;
    /** Interrupt timestamps for storm / collision detection. */
    private _mqttInterrupts;
    /** Whether a forced MQTT reset is currently in progress (guards against re-entrancy). */
    private _mqttResetInProgress;
    /** The device IDs that are currently being updated in real-time, mapped to their respective timeouts. */
    private _realtimeDeviceIds;
    /** The cached devices object, if any. */
    private _cachedDevices?;
    /**
     * Event emitter for client events.
     *
     * @see {@link MysaApiClientEventTypes} for the possible events and their payloads.
     */
    readonly emitter: EventEmitter<MysaApiClientEventTypes>;
    /**
     * Gets the persistable session object.
     *
     * @returns The current persistable session object, if any.
     */
    get session(): MysaSession | undefined;
    /**
     * Returns whether the client currently has an active session.
     *
     * @returns True if the client has an active session, false otherwise.
     */
    get isAuthenticated(): boolean;
    /**
     * Constructs a new instance of the MysaApiClient.
     *
     * @param session - The persistable session object, if any.
     * @param options - The options for the client.
     */
    constructor(session?: MysaSession, options?: MysaApiClientOptions);
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
    login(emailAddress: string, password: string): Promise<void>;
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
    getDevices(): Promise<Devices>;
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
    getDeviceSerialNumber(deviceId: string): Promise<string | undefined>;
    /**
     * Retrieves firmware information for all devices.
     *
     * @returns A promise that resolves to the firmware information for all devices.
     * @throws {@link MysaApiError} When the API request fails.
     * @throws {@link UnauthenticatedError} When the user is not authenticated.
     */
    getDeviceFirmwares(): Promise<Firmwares>;
    /**
     * Retrieves the current state information for all devices.
     *
     * @returns A promise that resolves to the current state of all devices.
     * @throws {@link MysaApiError} When the API request fails.
     * @throws {@link UnauthenticatedError} When the user is not authenticated.
     */
    getDeviceStates(): Promise<DeviceStates>;
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
    setDeviceState(deviceId: string, setPoint?: number, mode?: MysaDeviceMode, fanSpeed?: MysaFanSpeedMode): Promise<void>;
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
    startRealtimeUpdates(deviceId: string): Promise<void>;
    /**
     * Stops receiving real-time updates for the specified device.
     *
     * This method unsubscribes from the MQTT topic for the specified device and clears any associated timers to stop the
     * keep-alive messages.
     *
     * @param deviceId - The ID of the device to stop receiving real-time updates for.
     * @throws {@link Error} When MQTT unsubscription fails.
     */
    stopRealtimeUpdates(deviceId: string): Promise<void>;
    /**
     * Ensures a valid, non-expired session is available.
     *
     * This method checks if the current session is valid and not expired. If the session is expired, it automatically
     * refreshes it using the refresh token.
     *
     * @returns A promise that resolves to a valid CognitoUserSession.
     * @throws {@link UnauthenticatedError} When no session exists or refresh fails.
     */
    private _getFreshSession;
    /**
     * Establishes and returns an MQTT connection for real-time communication.
     *
     * This method creates a new MQTT connection if one doesn't exist, using AWS IoT WebSocket connections with Cognito
     * credentials. The connection is cached and reused for subsequent calls.
     *
     * @returns A promise that resolves to an active MQTT connection.
     * @throws {@link Error} When connection establishment fails.
     */
    private _getMqttConnection;
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
    private _isTransientMqttError;
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
    private _publishWithRetry;
    /**
     * Creates a new MQTT connection using AWS IoT WebSocket connections with Cognito credentials.
     *
     * @returns A promise that resolves to an active MQTT connection.
     * @throws {@link Error} When connection establishment fails.
     */
    private _createMqttConnection;
    /**
     * Processes incoming MQTT messages and emits appropriate events.
     *
     * This method parses MQTT payloads and converts them into typed events that can be listened to via the client's event
     * emitter. It handles both v1 and v2 device message formats and emits events like 'statusChanged', 'setPointChanged',
     * and 'stateChanged'.
     *
     * @param payload - The raw MQTT message payload to process.
     */
    private _processMqttMessage;
}

/**
 * Enumeration of message types for incoming MQTT messages from clients to devices.
 *
 * These message types determine how commands and requests are interpreted by Mysa devices. The enum values correspond
 * to specific numeric identifiers used in the MQTT protocol.
 */
declare enum InMessageType {
    /** Request to check and retrieve current device settings */
    CHECK_DEVICE_SETTINGS = 6,
    /** Command to start publishing periodic device status updates */
    START_PUBLISHING_DEVICE_STATUS = 11,
    /** Command to change the current state of a device (temperature, mode, etc.) */
    CHANGE_DEVICE_STATE = 44
}

/**
 * Interface representing a command to change the state of a Mysa device.
 *
 * This message type allows clients to modify device settings such as temperature setpoint and operating mode. The
 * command is structured with source and destination routing information along with the specific state changes to
 * apply.
 */
interface ChangeDeviceState extends MsgPayload<InMessageType.CHANGE_DEVICE_STATE> {
    /** Source routing information for the command */
    src: {
        /** Reference identifier for the command source. Should correspond to the user id. */
        ref: string;
        /** Type identifier for the source. Should be 100. */
        type: number;
    };
    /** Destination routing information for the command */
    dest: {
        /** Reference identifier for the command destination (device) */
        ref: string;
        /** Type identifier for the destination. Should be 1. */
        type: number;
    };
    /** Unknown, should always be 2. */
    resp: number;
    /** Command payload containing the state changes to apply */
    body: {
        /** Array of command objects to execute */
        cmd: [
            {
                /** Optional temperature setpoint in the device's configured units */
                sp?: number;
                /** Optional device mode (e.g., heat, off) */
                md?: number;
                /** Unknown, should always be -1 */
                tm: number;
                /** Optional fan speed (1 = auto, 3 = low, 5 = medium, 7 = high, 8 = max). AC only */
                fn?: number;
            }
        ];
        /**
         * Command type identifier. Must be 1 for BB-V1-X, 4 for BB-V2-X, and 5 for BB-V2-X-L. Devices don't seem to respond
         * to this command if it has the wrong type value for the device.
         */
        type: number;
        /** Command format version. Should be 1. */
        ver: number;
    };
}

/**
 * Interface representing a request to check and retrieve device settings.
 *
 * This message is sent to query a device for its current configuration and settings. The response typically includes
 * device parameters, modes, and other configuration data needed for proper device management.
 */
interface CheckDeviceSettings extends MsgTypePayload<InMessageType.CHECK_DEVICE_SETTINGS> {
    /** Event type identifier specifying what kind of settings check to perform */
    EventType: number;
}

/**
 * Interface representing a command to start publishing periodic device status updates.
 *
 * This message instructs a device to begin sending regular status reports at predefined intervals. The timeout
 * parameter controls how long the device should continue publishing status updates before stopping automatically.
 */
interface StartPublishingDeviceStatus extends MsgTypePayload<InMessageType.START_PUBLISHING_DEVICE_STATUS> {
    /** Timeout duration in seconds for how long to continue publishing status updates */
    Timeout: number;
}

/**
 * Union type representing all possible incoming message-based MQTT payloads.
 *
 * This type encompasses payloads where the message type is specified in the `msg` field rather than the `MsgType`
 * field. Currently includes device state change commands.
 */
type MsgInPayload = ChangeDeviceState;

/**
 * Union type representing all possible incoming MsgType-based MQTT payloads.
 *
 * This type encompasses payloads where the message type is specified in the `MsgType` field rather than the `msg`
 * field. These are typically configuration and control commands that use the legacy message format structure.
 */
type MsgTypeInPayload = CheckDeviceSettings | StartPublishingDeviceStatus;

/**
 * Union type representing all possible incoming MQTT payload types.
 *
 * This type encompasses both message type-based payloads and message-based payloads that can be received from Mysa
 * devices via MQTT.
 */
type InPayload = MsgTypeInPayload | MsgInPayload;

export { type BrandInfo, type ChangeDeviceState, type CheckDeviceSettings, type DeviceBase, type DeviceLog, type DevicePostBoot, type DeviceSetpointChange, type DeviceState, type DeviceStateChange, type DeviceStates, type DeviceStatesObj, type DeviceV1Status, type DeviceV2Status, type Devices, type DevicesObj, type FirmwareDevice, type Firmwares, InMessageType, type InPayload, type Logger, type ModeObj, MqttPublishError, type MqttPublishOptions, type MsgBasePayload, type MsgInPayload, type MsgOutPayload, type MsgPayload, type MsgTypeBasePayload, type MsgTypeInPayload, type MsgTypeOutPayload, type MsgTypePayload, MysaApiClient, type MysaApiClientEventTypes, type MysaApiClientOptions, MysaApiError, type MysaDeviceMode, type MysaFanSpeedMode, type MysaSession, OutMessageType, type OutPayload, type SetPointChange, type StartPublishingDeviceStatus, type StateChange, type Status, type SupportedCaps, type TimestampedValue, UnauthenticatedError, VoidLogger };
