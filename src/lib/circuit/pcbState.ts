// Top-Down Zero-Gravity Full-Screen Ultra-Wide PCB State: 14 ICs, 14 Sockets, 32+ LEDs, and Edge-to-Edge Multi-Bus Traces

export interface SocketDef {
  id: string;
  name: string;
  pinCount: number; // 28, 16, 14, 8
  pinsPerSide: number;
  x: number;
  y: number;
  width: number;
  height: number;
  occupiedBy: string | null;
  traceId: string;
}

export interface ICDef {
  id: string;
  label: string;
  pinCount: number;
  pinsPerSide: number;
  width: number;
  height: number;
  x: number;
  y: number;
  defaultSocketId: string;
  currentSocketId: string | null;
  visible?: boolean;
  isBouncing?: boolean;
  staggerIndex?: number;
  inspection: {
    title: string;
    subtitle?: string;
    status: string;
    auth?: string;
    description?: string;
    specs: string[];
  };
}

export interface LEDDef {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  drivenBySocketId: string;
  blinkRate: number; // ms
  phaseOffset?: number;
}

export interface TraceDef {
  id: string;
  drivingSocketId: string;
  color: string;
  glowColor: string;
  points: [number, number][];
}

export interface HardwareDeco {
  type: 'crystal' | 'capacitor' | 'header' | 'regulator';
  x: number;
  y: number;
  label?: string;
  width?: number;
  height?: number;
}

export interface PCBSystemConfig {
  sockets: SocketDef[];
  ics: ICDef[];
  leds: LEDDef[];
  traces: TraceDef[];
  decos: HardwareDeco[];
}

export function createDefaultPCBConfig(): PCBSystemConfig {
  // 14 Sockets spanning far-left to far-right across the entire screen
  const sockets: SocketDef[] = [
    // Far-Left Column (X ~ -580 to -600)
    { id: 'socket-pwr', name: 'SOCKET U0 (16-DIP PWR)', pinCount: 16, pinsPerSide: 8, x: -590, y: 160, width: 135, height: 58, occupiedBy: 'ic-tps', traceId: 'trace-pwr-bus' },
    { id: 'socket-motor', name: 'SOCKET U2 (16-DIP MOT)', pinCount: 16, pinsPerSide: 8, x: -590, y: -100, width: 135, height: 58, occupiedBy: 'ic-l293d', traceId: 'trace-motor' },

    // Mid-Left Column (X ~ -340 to -380)
    { id: 'socket-mcu', name: 'SOCKET U1 (28-DIP MCU)', pinCount: 28, pinsPerSide: 14, x: -350, y: 60, width: 190, height: 68, occupiedBy: 'ic-atmega', traceId: 'trace-mcu' },
    { id: 'socket-eeprom', name: 'SOCKET U11 (8-DIP EEPROM)', pinCount: 8, pinsPerSide: 4, x: -350, y: -180, width: 85, height: 50, occupiedBy: 'ic-24c', traceId: 'trace-eeprom' },

    // Center-Left Column (X ~ -80 to -100)
    { id: 'socket-shift-out', name: 'SOCKET U3 (16-DIP SR)', pinCount: 16, pinsPerSide: 8, x: -80, y: 220, width: 135, height: 58, occupiedBy: 'ic-595', traceId: 'trace-shift-out' },
    { id: 'socket-555', name: 'SOCKET U9 (8-DIP CLK)', pinCount: 8, pinsPerSide: 4, x: -80, y: -40, width: 85, height: 50, occupiedBy: 'ic-555', traceId: 'trace-555' },
    { id: 'socket-attiny', name: 'SOCKET U12 (8-DIP AVR)', pinCount: 8, pinsPerSide: 4, x: -80, y: -240, width: 85, height: 50, occupiedBy: 'ic-t85', traceId: 'trace-attiny' },

    // Center-Right Column (X ~ +120 to +140)
    { id: 'socket-shift-in', name: 'SOCKET U4 (16-DIP PAR)', pinCount: 16, pinsPerSide: 8, x: 130, y: 220, width: 135, height: 58, occupiedBy: 'ic-165', traceId: 'trace-shift-in' },
    { id: 'socket-358', name: 'SOCKET U10 (8-DIP OP)', pinCount: 8, pinsPerSide: 4, x: 130, y: -40, width: 85, height: 50, occupiedBy: 'ic-358', traceId: 'trace-358' },

    // Mid-Right Column (X ~ +350 to +380)
    { id: 'socket-7404', name: 'SOCKET U5 (14-DIP NOT)', pinCount: 14, pinsPerSide: 7, x: 360, y: 200, width: 120, height: 56, occupiedBy: 'ic-7404', traceId: 'trace-7404' },
    { id: 'socket-7408', name: 'SOCKET U6 (14-DIP AND)', pinCount: 14, pinsPerSide: 7, x: 360, y: 40, width: 120, height: 56, occupiedBy: 'ic-7408', traceId: 'trace-7408' },
    { id: 'socket-7432', name: 'SOCKET U7 (14-DIP OR)', pinCount: 14, pinsPerSide: 7, x: 360, y: -120, width: 120, height: 56, occupiedBy: 'ic-7432', traceId: 'trace-7432' },

    // Far-Right Column (X ~ +580 to +600)
    { id: 'socket-7486', name: 'SOCKET U8 (14-DIP XOR)', pinCount: 14, pinsPerSide: 7, x: 590, y: 140, width: 120, height: 56, occupiedBy: 'ic-7486', traceId: 'trace-7486' },
    { id: 'socket-can', name: 'SOCKET U14 (8-DIP CAN)', pinCount: 8, pinsPerSide: 4, x: 590, y: -80, width: 85, height: 50, occupiedBy: 'ic-mcp', traceId: 'trace-can' },

    // Outer-Left Wing (X ~ -820)
    { id: 'socket-adc', name: 'SOCKET U15 (16-DIP ADC)', pinCount: 16, pinsPerSide: 8, x: -820, y: 180, width: 135, height: 58, occupiedBy: 'ic-adc', traceId: 'trace-adc' },
    { id: 'socket-iso', name: 'SOCKET U16 (16-DIP ISO)', pinCount: 16, pinsPerSide: 8, x: -820, y: -120, width: 135, height: 58, occupiedBy: 'ic-iso', traceId: 'trace-iso' },

    // Outer-Right Wing (X ~ +820)
    { id: 'socket-rtc', name: 'SOCKET U17 (8-DIP RTC)', pinCount: 8, pinsPerSide: 4, x: 820, y: 180, width: 85, height: 50, occupiedBy: 'ic-rtc', traceId: 'trace-rtc' },
    { id: 'socket-rs485', name: 'SOCKET U18 (8-DIP 485)', pinCount: 8, pinsPerSide: 4, x: 820, y: -120, width: 85, height: 50, occupiedBy: 'ic-rs485', traceId: 'trace-rs485' }
  ];

  // 14 IC Components
  const ics: ICDef[] = [
    {
      id: 'ic-atmega',
      label: 'ATMEGA328P-PU',
      pinCount: 28,
      pinsPerSide: 14,
      width: 190,
      height: 68,
      x: -350,
      y: 60,
      defaultSocketId: 'socket-mcu',
      currentSocketId: 'socket-mcu',
      inspection: {
        title: 'ATmega328P (8-bit AVR)',
        subtitle: 'The heart of the Arduino Uno.',
        status: 'STATUS: Online',
        auth: 'AUTH: Arhan is officially Arduino Certified.',
        description: 'Microchip AVR 8-bit RISC microcontroller with 32KB flash, 2KB SRAM, 1KB EEPROM, operating at 16MHz.',
        specs: ['Clock: 16.0 MHz Crystal Sync', 'Flash: 32 KB ISP Memory', 'Pins: 28-DIP (14 per side)', 'I/O: 23 Programmable GPIOs', 'AUTH: Officially Arduino Certified Professional']
      }
    },
    {
      id: 'ic-tps',
      label: 'TPS65987-PD',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: -590,
      y: 160,
      defaultSocketId: 'socket-pwr',
      currentSocketId: 'socket-pwr',
      inspection: {
        title: 'TPS65987 USB-PD Controller - 16 Pin',
        subtitle: 'Power Delivery & Bus Switch Array',
        status: 'STATUS: Power Delivery Armed',
        description: 'High-efficiency power management switch controller delivering regulated 20V/5A power negotiation over USB Type-C.',
        specs: ['Package: 16-Pin DIP', 'Efficiency: 96.5%', 'Protection: OVP / OCP / Thermal']
      }
    },
    {
      id: 'ic-l293d',
      label: 'L293D-H-BRIDGE',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: -590,
      y: -100,
      defaultSocketId: 'socket-motor',
      currentSocketId: 'socket-motor',
      inspection: {
        title: 'L293D Dual H-Bridge Motor Driver - 16 Pin',
        subtitle: 'High-Current Quad Push-Pull Drivers',
        status: 'STATUS: Motor Rails Armed',
        description: 'Quadruple high-current half-H driver for bidirectional control of inductive loads such as DC motors and steppers.',
        specs: ['Package: 16-Pin DIP (8 per side)', 'Peak Current: 1.2A per channel', 'Supply: Up to 36V DC']
      }
    },
    {
      id: 'ic-595',
      label: '74HC595N',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: -80,
      y: 220,
      defaultSocketId: 'socket-shift-out',
      currentSocketId: 'socket-shift-out',
      inspection: {
        title: '74HC595 8-Bit Shift Register - 16 Pin',
        subtitle: 'Serial-In Parallel-Out Storage Register',
        status: 'STATUS: Shifting Data',
        description: '8-stage serial shift register with storage latches and 3-state outputs for expanding MCU I/O pins.',
        specs: ['Package: 16-Pin DIP', 'Shift Clock: Up to 100 MHz', 'Outputs: 8 Parallel Bits']
      }
    },
    {
      id: 'ic-165',
      label: '74HC165N',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: 130,
      y: 220,
      defaultSocketId: 'socket-shift-in',
      currentSocketId: 'socket-shift-in',
      inspection: {
        title: '74HC165 8-Bit Shift Register - 16 Pin',
        subtitle: 'Parallel-In Serial-Out Input Expander',
        status: 'STATUS: Scanning Inputs',
        description: 'Parallel-load 8-bit shift register designed to sample 8 digital input sensors into a serial data stream.',
        specs: ['Package: 16-Pin DIP', 'Mode: Parallel-In Serial-Out', 'Delay: 14 ns']
      }
    },
    {
      id: 'ic-7404',
      label: 'SN74HC04N',
      pinCount: 14,
      pinsPerSide: 7,
      width: 120,
      height: 56,
      x: 360,
      y: 200,
      defaultSocketId: 'socket-7404',
      currentSocketId: 'socket-7404',
      inspection: {
        title: '7404 Hex Inverter IC - 14 Pin',
        subtitle: 'High-Speed CMOS Logic Array',
        status: 'STATUS: Logic Armed',
        description: 'Hexadecimal inverting NOT gate array containing six independent logic inverters with ~9ns delay.',
        specs: ['Package: 14-Pin DIP (7 per side)', 'Gates: 6 Independent NOT Inverters', 'Delay: ~9 ns']
      }
    },
    {
      id: 'ic-7408',
      label: 'SN74HC08N',
      pinCount: 14,
      pinsPerSide: 7,
      width: 120,
      height: 56,
      x: 360,
      y: 40,
      defaultSocketId: 'socket-7408',
      currentSocketId: 'socket-7408',
      inspection: {
        title: '7408 Quad 2-Input AND Gate - 14 Pin',
        subtitle: 'Positive-AND Logic Engine',
        status: 'STATUS: Armed',
        description: 'Four independent 2-input positive-AND gates performing Boolean logic Y = A • B.',
        specs: ['Package: 14-Pin DIP', 'Gates: 4 Dual-Input AND Gates', 'Delay: 11 ns']
      }
    },
    {
      id: 'ic-7432',
      label: 'SN74HC32N',
      pinCount: 14,
      pinsPerSide: 7,
      width: 120,
      height: 56,
      x: 360,
      y: -120,
      defaultSocketId: 'socket-7432',
      currentSocketId: 'socket-7432',
      inspection: {
        title: '7432 Quad 2-Input OR Gate - 14 Pin',
        subtitle: 'Positive-OR Logic Engine',
        status: 'STATUS: Armed',
        description: 'Four independent 2-input positive-OR gates executing Boolean logic Y = A + B.',
        specs: ['Package: 14-Pin DIP', 'Gates: 4 Dual-Input OR Gates', 'Voltage: 2.0V - 6.0V']
      }
    },
    {
      id: 'ic-7486',
      label: 'SN74HC86N',
      pinCount: 14,
      pinsPerSide: 7,
      width: 120,
      height: 56,
      x: 590,
      y: 140,
      defaultSocketId: 'socket-7486',
      currentSocketId: 'socket-7486',
      inspection: {
        title: '7486 Quad 2-Input XOR Gate - 14 Pin',
        subtitle: 'Exclusive-OR Arithmetic Core',
        status: 'STATUS: Armed',
        description: 'Four independent 2-input exclusive-OR gates for hardware adders and parity checking.',
        specs: ['Package: 14-Pin DIP', 'Gates: 4 Dual-Input XOR Gates', 'Delay: 12 ns']
      }
    },
    {
      id: 'ic-555',
      label: 'NE555P',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: -80,
      y: -40,
      defaultSocketId: 'socket-555',
      currentSocketId: 'socket-555',
      inspection: {
        title: 'NE555 Precision Timer - 8 Pin',
        subtitle: 'Bipolar Pulse & Clock Generator',
        status: 'STATUS: Oscillating',
        description: 'Precision timing circuit generating accurate clock delays and astable pulses from microseconds to hours.',
        specs: ['Package: 8-Pin DIP', 'Modes: Astable / Monostable', 'Frequency: ~2.1 MHz']
      }
    },
    {
      id: 'ic-358',
      label: 'LM358P',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: 130,
      y: -40,
      defaultSocketId: 'socket-358',
      currentSocketId: 'socket-358',
      inspection: {
        title: 'LM358 Dual Operational Amplifier - 8 Pin',
        subtitle: 'High-Gain Dual Op-Amp Core',
        status: 'STATUS: Differential Active',
        description: 'Two independent, high-gain, internally frequency-compensated operational amplifiers.',
        specs: ['Package: 8-Pin DIP', 'Gain Bandwidth: 1.1 MHz', 'Supply: 3V - 32V']
      }
    },
    {
      id: 'ic-24c',
      label: 'AT24C256-EEPROM',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: -350,
      y: -180,
      defaultSocketId: 'socket-eeprom',
      currentSocketId: 'socket-eeprom',
      inspection: {
        title: 'AT24C256 I2C EEPROM - 8 Pin',
        subtitle: 'Non-Volatile Flash Storage',
        status: 'STATUS: Memory Armed',
        description: '256-Kbit serial electrically erasable and programmable read-only memory organized as 32KB words.',
        specs: ['Package: 8-Pin DIP', 'Interface: 2-Wire I2C Serial', 'Capacity: 32 KB']
      }
    },
    {
      id: 'ic-t85',
      label: 'ATTINY85-20PU',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: -80,
      y: -240,
      defaultSocketId: 'socket-attiny',
      currentSocketId: 'socket-attiny',
      inspection: {
        title: 'ATtiny85 Microcontroller - 8 Pin',
        subtitle: 'Ultra-Compact 8-Bit AVR MCU',
        status: 'STATUS: Standby Core',
        description: 'Low-power 8-bit AVR RISC microcontroller featuring 8KB ISP flash memory, 512B EEPROM, and 512B SRAM.',
        specs: ['Package: 8-Pin DIP', 'Clock: Up to 20 MHz', 'Flash: 8 KB']
      }
    },
    {
      id: 'ic-mcp',
      label: 'MCP2551-CAN',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: 590,
      y: -80,
      defaultSocketId: 'socket-can',
      currentSocketId: 'socket-can',
      inspection: {
        title: 'MCP2551 High-Speed CAN Transceiver - 8 Pin',
        subtitle: 'Differential Automotive Bus Interface',
        status: 'STATUS: CAN Bus Online',
        description: 'Fault-tolerant high-speed CAN transceiver serving as interface between protocol controller and physical bus wires.',
        specs: ['Package: 8-Pin DIP', 'Speed: 1 Mb/s', 'Standard: ISO-11898 Physical Layer']
      }
    },
    {
      id: 'ic-adc',
      label: 'ADC0804-8BIT',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: -820,
      y: 180,
      defaultSocketId: 'socket-adc',
      currentSocketId: 'socket-adc',
      inspection: {
        title: 'ADC0804 8-Bit A/D Converter - 16 Pin',
        subtitle: 'Successive Approximation ADC',
        status: 'STATUS: Sampling Analog',
        description: 'Microprocessor-compatible 8-bit analog-to-digital converter using a successive approximation register with tri-state outputs.',
        specs: ['Package: 16-Pin DIP', 'Resolution: 8-Bit SAR', 'Conversion Time: 100 µs', 'Supply: 5V DC']
      }
    },
    {
      id: 'ic-iso',
      label: 'ILD213T-OPTO',
      pinCount: 16,
      pinsPerSide: 8,
      width: 135,
      height: 58,
      x: -820,
      y: -120,
      defaultSocketId: 'socket-iso',
      currentSocketId: 'socket-iso',
      inspection: {
        title: 'ILD213T Quad Optoisolator - 16 Pin',
        subtitle: 'High-Voltage Galvanic Barrier',
        status: 'STATUS: Barrier Armed',
        description: 'Four-channel optically coupled isolator with GaAs infrared emitting diode and silicon phototransistor.',
        specs: ['Package: 16-Pin DIP', 'Isolation: 5300V RMS', 'Channels: 4 Isolated Phototransistors', 'CTR: > 100%']
      }
    },
    {
      id: 'ic-rtc',
      label: 'DS1307-RTC',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: 820,
      y: 180,
      defaultSocketId: 'socket-rtc',
      currentSocketId: 'socket-rtc',
      inspection: {
        title: 'DS1307 64 x 8 Serial Real-Time Clock - 8 Pin',
        subtitle: 'I2C Precision Chrono Master',
        status: 'STATUS: Clock Synced',
        description: 'Low-power full binary-coded decimal clock/calendar plus 56 bytes of NV SRAM, with battery-backup circuitry.',
        specs: ['Package: 8-Pin DIP', 'Protocol: 2-Wire I2C', 'Crystal: 32.768 kHz Ext', 'Battery Backup: Active']
      }
    },
    {
      id: 'ic-rs485',
      label: 'MAX485-TRANS',
      pinCount: 8,
      pinsPerSide: 4,
      width: 85,
      height: 50,
      x: 820,
      y: -120,
      defaultSocketId: 'socket-rs485',
      currentSocketId: 'socket-rs485',
      inspection: {
        title: 'MAX485 Differential Transceiver - 8 Pin',
        subtitle: 'Industrial Long-Range Bus Line',
        status: 'STATUS: Line Transceiver Active',
        description: 'Low-power transceiver for RS-485 and RS-422 communications containing one driver and one receiver.',
        specs: ['Package: 8-Pin DIP', 'Standard: RS-485 / RS-422', 'Data Rate: 2.5 Mbps', 'Common-Mode: -7V to +12V']
      }
    }
  ];

  // 32+ LEDs across the full ultra-wide canvas
  const leds: LEDDef[] = [
    // Far-Left Power & Motor LEDs
    { id: 'led-pwr-pd', name: 'PD_20V_LED', x: -690, y: 190, color: '#00E5FF', radius: 8, drivenBySocketId: 'socket-pwr', blinkRate: 1400, phaseOffset: 0 },
    { id: 'led-pwr-stat', name: 'PD_STAT_LED', x: -500, y: 190, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-pwr', blinkRate: 800, phaseOffset: 50 },
    { id: 'led-mot-a', name: 'MOT_DIR_A', x: -690, y: -140, color: '#FF3366', radius: 8, drivenBySocketId: 'socket-motor', blinkRate: 500, phaseOffset: 0 },
    { id: 'led-mot-b', name: 'MOT_DIR_B', x: -500, y: -140, color: '#00E5FF', radius: 8, drivenBySocketId: 'socket-motor', blinkRate: 500, phaseOffset: 250 },

    // Mid-Left MCU & EEPROM LEDs
    { id: 'led-mcu-pwr', name: 'MCU_PWR_LED', x: -460, y: 110, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-mcu', blinkRate: 700, phaseOffset: 0 },
    { id: 'led-mcu-stat', name: 'MCU_STAT_LED', x: -240, y: 110, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-mcu', blinkRate: 1100, phaseOffset: 120 },
    { id: 'led-tx', name: 'UART_TX_LED', x: -460, y: 10, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-mcu', blinkRate: 200, phaseOffset: 30 },
    { id: 'led-rx', name: 'UART_RX_LED', x: -430, y: 10, color: '#FFB300', radius: 7, drivenBySocketId: 'socket-mcu', blinkRate: 250, phaseOffset: 150 },
    { id: 'led-i2c-sda', name: 'I2C_SDA', x: -420, y: -180, color: '#38BDF8', radius: 7, drivenBySocketId: 'socket-eeprom', blinkRate: 280, phaseOffset: 40 },
    { id: 'led-i2c-scl', name: 'I2C_SCL', x: -280, y: -180, color: '#38BDF8', radius: 7, drivenBySocketId: 'socket-eeprom', blinkRate: 320, phaseOffset: 100 },

    // Center Shift Register 4-LED Walking Bar (OUT)
    { id: 'led-sr-1', name: 'SR_Q0', x: -140, y: 280, color: '#00FF41', radius: 7, drivenBySocketId: 'socket-shift-out', blinkRate: 400, phaseOffset: 0 },
    { id: 'led-sr-2', name: 'SR_Q1', x: -100, y: 280, color: '#00FF41', radius: 7, drivenBySocketId: 'socket-shift-out', blinkRate: 400, phaseOffset: 100 },
    { id: 'led-sr-3', name: 'SR_Q2', x: -60, y: 280, color: '#00FF41', radius: 7, drivenBySocketId: 'socket-shift-out', blinkRate: 400, phaseOffset: 200 },
    { id: 'led-sr-4', name: 'SR_Q3', x: -20, y: 280, color: '#00FF41', radius: 7, drivenBySocketId: 'socket-shift-out', blinkRate: 400, phaseOffset: 300 },

    // Center Shift Register 4-LED Bar (IN)
    { id: 'led-srin-1', name: 'SR_IN_D0', x: 70, y: 280, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-shift-in', blinkRate: 450, phaseOffset: 40 },
    { id: 'led-srin-2', name: 'SR_IN_D1', x: 110, y: 280, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-shift-in', blinkRate: 450, phaseOffset: 140 },
    { id: 'led-srin-3', name: 'SR_IN_D2', x: 150, y: 280, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-shift-in', blinkRate: 450, phaseOffset: 240 },
    { id: 'led-srin-4', name: 'SR_IN_D3', x: 190, y: 280, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-shift-in', blinkRate: 450, phaseOffset: 340 },

    // Center Timer & Op-Amp & ATtiny LEDs
    { id: 'led-clk-555', name: 'CLK_555', x: -80, y: 20, color: '#FFB300', radius: 8, drivenBySocketId: 'socket-555', blinkRate: 350, phaseOffset: 0 },
    { id: 'led-opamp', name: 'ANALOG_ALERT', x: 130, y: 20, color: '#FF3366', radius: 8, drivenBySocketId: 'socket-358', blinkRate: 700, phaseOffset: 60 },
    { id: 'led-tiny-stat', name: 'TINY_HEARTBEAT', x: -80, y: -290, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-attiny', blinkRate: 800, phaseOffset: 140 },

    // Mid-Right Logic Gate LEDs
    { id: 'led-logic-04', name: 'NOT_OUT', x: 440, y: 200, color: '#00E5FF', radius: 8, drivenBySocketId: 'socket-7404', blinkRate: 480, phaseOffset: 80 },
    { id: 'led-logic-08', name: 'AND_OUT', x: 440, y: 40, color: '#10B981', radius: 8, drivenBySocketId: 'socket-7408', blinkRate: 640, phaseOffset: 160 },
    { id: 'led-logic-32', name: 'OR_OUT', x: 440, y: -120, color: '#A855F7', radius: 8, drivenBySocketId: 'socket-7432', blinkRate: 520, phaseOffset: 90 },

    // Far-Right XOR & CAN Bus LEDs
    { id: 'led-logic-86', name: 'XOR_OUT', x: 670, y: 140, color: '#F59E0B', radius: 8, drivenBySocketId: 'socket-7486', blinkRate: 580, phaseOffset: 210 },
    { id: 'led-can-rx', name: 'CAN_RX', x: 670, y: -50, color: '#00E5FF', radius: 7, drivenBySocketId: 'socket-can', blinkRate: 230, phaseOffset: 40 },
    { id: 'led-can-tx', name: 'CAN_TX', x: 670, y: -110, color: '#FFB300', radius: 7, drivenBySocketId: 'socket-can', blinkRate: 230, phaseOffset: 160 },

    // Outer Perimeter Power Rails Indicators
    { id: 'led-rail-5v-l', name: 'RAIL_5V_L', x: -740, y: 280, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-pwr', blinkRate: 1500, phaseOffset: 0 },
    { id: 'led-rail-3v3-l', name: 'RAIL_3V3_L', x: -740, y: -260, color: '#38BDF8', radius: 8, drivenBySocketId: 'socket-motor', blinkRate: 1800, phaseOffset: 50 },
    { id: 'led-rail-5v-r', name: 'RAIL_5V_R', x: 740, y: 280, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-7486', blinkRate: 1500, phaseOffset: 100 },
    { id: 'led-rail-12v-r', name: 'RAIL_12V_R', x: 740, y: -260, color: '#FF3366', radius: 8, drivenBySocketId: 'socket-can', blinkRate: 2000, phaseOffset: 150 },

    // Far-Left Outer Wing LEDs (X ~ -900 to -980)
    { id: 'led-adc-eoc', name: 'ADC_EOC', x: -900, y: 220, color: '#00E5FF', radius: 8, drivenBySocketId: 'socket-adc', blinkRate: 240, phaseOffset: 30 },
    { id: 'led-adc-conv', name: 'ADC_CONV', x: -740, y: 220, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-adc', blinkRate: 360, phaseOffset: 90 },
    { id: 'led-iso-1', name: 'ISO_CH1', x: -900, y: -70, color: '#FF3366', radius: 8, drivenBySocketId: 'socket-iso', blinkRate: 480, phaseOffset: 20 },
    { id: 'led-iso-2', name: 'ISO_CH2', x: -740, y: -70, color: '#FFB300', radius: 8, drivenBySocketId: 'socket-iso', blinkRate: 480, phaseOffset: 260 },
    { id: 'led-rail-hv-l', name: 'RAIL_HV_L', x: -980, y: 280, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-adc', blinkRate: 1600, phaseOffset: 0 },
    { id: 'led-rail-gnd-l', name: 'RAIL_GND_L', x: -980, y: -260, color: '#38BDF8', radius: 8, drivenBySocketId: 'socket-iso', blinkRate: 1900, phaseOffset: 70 },

    // Far-Right Outer Wing LEDs (X ~ +900 to +980)
    { id: 'led-rtc-sqw', name: 'RTC_1HZ', x: 900, y: 220, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-rtc', blinkRate: 1000, phaseOffset: 0 },
    { id: 'led-rtc-bat', name: 'RTC_VBAT', x: 740, y: 220, color: '#38BDF8', radius: 8, drivenBySocketId: 'socket-rtc', blinkRate: 1400, phaseOffset: 120 },
    { id: 'led-485-ro', name: 'RS485_RO', x: 900, y: -70, color: '#00E5FF', radius: 8, drivenBySocketId: 'socket-rs485', blinkRate: 260, phaseOffset: 40 },
    { id: 'led-485-di', name: 'RS485_DI', x: 740, y: -70, color: '#F59E0B', radius: 8, drivenBySocketId: 'socket-rs485', blinkRate: 260, phaseOffset: 170 },
    { id: 'led-rail-term-r', name: 'RAIL_TERM_R', x: 980, y: 280, color: '#00FF41', radius: 8, drivenBySocketId: 'socket-rtc', blinkRate: 1600, phaseOffset: 50 },
    { id: 'led-rail-diff-r', name: 'RAIL_DIFF_R', x: 980, y: -260, color: '#FF3366', radius: 8, drivenBySocketId: 'socket-rs485', blinkRate: 1900, phaseOffset: 110 }
  ];

  // Ultra-Wide Edge-to-Edge Multi-Bus Traces (Spanning X: -750 to +750)
  const traces: TraceDef[] = [
    // 1. Far-Left USB-PD to MCU Main Rail
    {
      id: 'trace-pwr-bus',
      drivingSocketId: 'socket-pwr',
      color: '#004752',
      glowColor: '#00E5FF',
      points: [
        [-740, 280],
        [-690, 190],
        [-590, 190], // socket-pwr
        [-500, 190],
        [-460, 110],
        [-350, 94]   // MCU
      ]
    },
    // 2. Far-Left Motor Driver Bus
    {
      id: 'trace-motor',
      drivingSocketId: 'socket-motor',
      color: '#4d1222',
      glowColor: '#FF3366',
      points: [
        [-740, -260],
        [-690, -140],
        [-590, -71], // socket-motor
        [-590, -129],
        [-500, -140],
        [-420, -100]
      ]
    },
    // 3. MCU Primary Power & Signal Rail
    {
      id: 'trace-mcu',
      drivingSocketId: 'socket-mcu',
      color: '#004d16',
      glowColor: '#00FF41',
      points: [
        [-460, 110],
        [-350, 94],  // MCU Pin 1
        [-270, 94],
        [-240, 110], // led-mcu-stat
        [-170, 110],
        [-80, 70]
      ]
    },
    // 4. MCU UART Communication Bus
    {
      id: 'trace-uart',
      drivingSocketId: 'socket-mcu',
      color: '#004752',
      glowColor: '#00E5FF',
      points: [
        [-350, 26],  // MCU Pin 2/3
        [-430, 10],  // led-rx
        [-460, 10],  // led-tx
        [-520, 10]
      ]
    },
    // 5. Shift Register OUT Bus
    {
      id: 'trace-shift-out',
      drivingSocketId: 'socket-shift-out',
      color: '#004d16',
      glowColor: '#00FF41',
      points: [
        [-80, 191],
        [-80, 249],
        [-140, 280], // led-sr-1
        [-100, 280], // led-sr-2
        [-60, 280],  // led-sr-3
        [-20, 280],  // led-sr-4
        [20, 280]
      ]
    },
    // 6. Shift Register IN Bus
    {
      id: 'trace-shift-in',
      drivingSocketId: 'socket-shift-in',
      color: '#004752',
      glowColor: '#00E5FF',
      points: [
        [130, 191],
        [130, 249],
        [70, 280],   // led-srin-1
        [110, 280],  // led-srin-2
        [150, 280],  // led-srin-3
        [190, 280],  // led-srin-4
        [250, 280]
      ]
    },
    // 7. Logic Bus: 7404 Hex Inverter
    {
      id: 'trace-7404',
      drivingSocketId: 'socket-7404',
      color: '#004752',
      glowColor: '#00E5FF',
      points: [
        [300, 200],
        [360, 172],  // 7404
        [360, 228],
        [440, 200],  // led-logic-04
        [510, 200]
      ]
    },
    // 8. Logic Bus: 7408 Quad AND
    {
      id: 'trace-7408',
      drivingSocketId: 'socket-7408',
      color: '#0a3d24',
      glowColor: '#10B981',
      points: [
        [300, 40],
        [360, 12],   // 7408
        [360, 68],
        [440, 40],   // led-logic-08
        [510, 40]
      ]
    },
    // 9. Logic Bus: 7432 Quad OR
    {
      id: 'trace-7432',
      drivingSocketId: 'socket-7432',
      color: '#3d164d',
      glowColor: '#A855F7',
      points: [
        [300, -120],
        [360, -148], // 7432
        [360, -92],
        [440, -120], // led-logic-32
        [510, -120]
      ]
    },
    // 10. Far-Right Logic Bus: 7486 Quad XOR
    {
      id: 'trace-7486',
      drivingSocketId: 'socket-7486',
      color: '#4d2d00',
      glowColor: '#F59E0B',
      points: [
        [530, 140],
        [590, 112],  // 7486
        [590, 168],
        [670, 140],  // led-logic-86
        [740, 280]
      ]
    },
    // 11. NE555 Clock Bus
    {
      id: 'trace-555',
      drivingSocketId: 'socket-555',
      color: '#4d3b00',
      glowColor: '#FFB300',
      points: [
        [-80, -65],
        [-80, -15],
        [-80, 20],   // led-clk-555
        [-20, 20],
        [40, 20]
      ]
    },
    // 12. LM358 Op-Amp Bus
    {
      id: 'trace-358',
      drivingSocketId: 'socket-358',
      color: '#4d1222',
      glowColor: '#FF3366',
      points: [
        [130, -65],
        [130, -15],
        [130, 20],   // led-opamp
        [200, 20],
        [270, 20]
      ]
    },
    // 13. I2C EEPROM Bus
    {
      id: 'trace-eeprom',
      drivingSocketId: 'socket-eeprom',
      color: '#0d3d52',
      glowColor: '#38BDF8',
      points: [
        [-350, -205],
        [-420, -180], // led-i2c-sda
        [-280, -180], // led-i2c-scl
        [-220, -180]
      ]
    },
    // 14. ATtiny85 Microcontroller Bus
    {
      id: 'trace-attiny',
      drivingSocketId: 'socket-attiny',
      color: '#004d16',
      glowColor: '#00FF41',
      points: [
        [-80, -265],
        [-80, -290], // led-tiny-stat
        [-20, -290],
        [40, -290]
      ]
    },
    // 15. Far-Right CAN Bus Interface
    {
      id: 'trace-can',
      drivingSocketId: 'socket-can',
      color: '#0d3d52',
      glowColor: '#38BDF8',
      points: [
        [590, -105],
        [670, -50],  // led-can-rx
        [670, -110], // led-can-tx
        [740, -260]
      ]
    },
    // 16. Far-Left Outer Wing: ADC0804 Analog Bus
    {
      id: 'trace-adc',
      drivingSocketId: 'socket-adc',
      color: '#004752',
      glowColor: '#00E5FF',
      points: [
        [-1000, 240],
        [-900, 220],  // led-adc-eoc
        [-820, 151],  // socket-adc
        [-820, 209],
        [-740, 220],  // led-adc-conv
        [-690, 190],
        [-590, 190]   // connects to socket-pwr
      ]
    },
    // 17. Far-Left Outer Wing: ILD213T High-Voltage Opto Bus
    {
      id: 'trace-iso',
      drivingSocketId: 'socket-iso',
      color: '#4d1222',
      glowColor: '#FF3366',
      points: [
        [-1000, -180],
        [-900, -70],   // led-iso-1
        [-820, -91],   // socket-iso
        [-820, -149],
        [-740, -70],   // led-iso-2
        [-690, -140],
        [-590, -100]   // connects to socket-motor
      ]
    },
    // 18. Far-Right Outer Wing: DS1307 Real-Time Clock I2C Bus
    {
      id: 'trace-rtc',
      drivingSocketId: 'socket-rtc',
      color: '#004d16',
      glowColor: '#00FF41',
      points: [
        [590, 140],    // from socket-7486
        [670, 140],
        [740, 220],    // led-rtc-bat
        [820, 155],    // socket-rtc
        [820, 205],
        [900, 220],    // led-rtc-sqw
        [1000, 240]
      ]
    },
    // 19. Far-Right Outer Wing: MAX485 Long-Range Differential Bus
    {
      id: 'trace-rs485',
      drivingSocketId: 'socket-rs485',
      color: '#4d2d00',
      glowColor: '#F59E0B',
      points: [
        [590, -80],    // from socket-can
        [670, -50],
        [740, -70],    // led-485-di
        [820, -95],    // socket-rs485
        [820, -145],
        [900, -70],    // led-485-ro
        [1000, -180]
      ]
    }
  ];

  // Hardware Decos across the broad landscape (spanning X: -960 to +960)
  const decos: HardwareDeco[] = [
    { type: 'crystal', x: -280, y: 5, label: '16.000 MHz' },
    { type: 'crystal', x: -10, y: -240, label: '20.000 MHz' },
    { type: 'crystal', x: 520, y: -80, label: '12.000 MHz' },
    { type: 'crystal', x: 880, y: 150, label: '32.768 kHz' },
    // Capacitors array
    { type: 'capacitor', x: -390, y: 95 },
    { type: 'capacitor', x: -310, y: 95 },
    { type: 'capacitor', x: -630, y: 195 },
    { type: 'capacitor', x: -630, y: -65 },
    { type: 'capacitor', x: -860, y: 210 },
    { type: 'capacitor', x: -860, y: -90 },
    { type: 'capacitor', x: -100, y: 250 },
    { type: 'capacitor', x: 110, y: 250 },
    { type: 'capacitor', x: 340, y: 230 },
    { type: 'capacitor', x: 340, y: 70 },
    { type: 'capacitor', x: 340, y: -90 },
    { type: 'capacitor', x: 570, y: 170 },
    { type: 'capacitor', x: 570, y: -50 },
    { type: 'capacitor', x: 860, y: 210 },
    { type: 'capacitor', x: 860, y: -90 },
    // Headers & Regulators
    { type: 'header', x: -940, y: 0, label: 'ANALOG CH0-7', width: 32, height: 60 },
    { type: 'header', x: -460, y: -80, label: 'ICSP / SPI', width: 36, height: 24 },
    { type: 'header', x: 260, y: 140, label: 'PARALLEL BUS', width: 44, height: 20 },
    { type: 'header', x: 710, y: 30, label: 'EXPANSION', width: 28, height: 50 },
    { type: 'header', x: 940, y: 0, label: 'DIFF BUS 485', width: 32, height: 60 },
    { type: 'regulator', x: -690, y: 110, label: 'AMS1117 3.3V', width: 26, height: 16 }
  ];

  return { sockets, ics, leds, traces, decos };
}

export function validateSocketDrop(
  ic: ICDef,
  dropX: number,
  dropY: number,
  sockets: SocketDef[]
): {
  targetSocket: SocketDef | null;
  isCompatible: boolean;
  isNearAnySocket: boolean;
} {
  const SNAP_THRESHOLD = 65;

  for (const socket of sockets) {
    const dist = Math.hypot(dropX - socket.x, dropY - socket.y);
    if (dist < SNAP_THRESHOLD) {
      const isCompatible = socket.pinCount === ic.pinCount;
      return {
        targetSocket: socket,
        isCompatible,
        isNearAnySocket: true
      };
    }
  }

  return {
    targetSocket: null,
    isCompatible: false,
    isNearAnySocket: false
  };
}

export function getDistanceToTrace(
  px: number,
  py: number,
  points: [number, number][]
): { dist: number; nearestX: number; nearestY: number } {
  let minDist = Infinity;
  let nearX = px;
  let nearY = py;

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];

    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    let t = l2 === 0 ? 0 : ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));

    const cx = x1 + t * (x2 - x1);
    const cy = y1 + t * (y2 - y1);
    const d = Math.hypot(px - cx, py - cy);

    if (d < minDist) {
      minDist = d;
      nearX = cx;
      nearY = cy;
    }
  }

  return { dist: minDist, nearestX: nearX, nearestY: nearY };
}
