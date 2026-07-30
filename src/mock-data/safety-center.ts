import type {
  EmergencyContact,
  EmergencyService,
  IncidentReport,
  SafetySettings,
  SosIncident
} from "@/types/safety-center";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

/** Seed SOS incidents for Admin Safety Center (mock only). */
export const sosIncidentsSeed: SosIncident[] = [
  {
    id: "sos-1",
    code: "SOS-2401",
    status: "ACTIVE",
    trigger: "PANIC_BUTTON",
    city: "Karachi",
    severity: "CRITICAL",
    reportedAt: minutesAgo(8),
    location: {
      lat: 24.8607,
      lng: 67.0011,
      label: "Shahrah-e-Faisal near Nursery",
      updatedAt: minutesAgo(1)
    },
    trip: {
      id: "trip-901",
      rideId: "RIDE-77821",
      riderName: "Ayesha Khan",
      riderPhone: "+92 300 1112233",
      driverName: "Imran Ali",
      driverPhone: "+92 321 4455667",
      vehiclePlate: "KHI-4521",
      pickup: "Clifton Block 5",
      dropoff: "Saddar",
      status: "IN_PROGRESS",
      startedAt: minutesAgo(32),
      fareEstimate: 780
    },
    notes: "Rider pressed in-app SOS. Last ping shows vehicle still moving.",
    caseNotes: [
      {
        id: "cn-1",
        channel: "RIDER",
        body: "Rider confirmed they pressed SOS intentionally. Felt unsafe after route change.",
        author: "Rider · Ayesha Khan",
        createdAt: minutesAgo(6),
        attachments: []
      },
      {
        id: "cn-2",
        channel: "PARTNER",
        body: "Partner desk said driver was asked to stick to main roads only.",
        author: "Partner · Imran Ali",
        createdAt: minutesAgo(4),
        attachments: []
      },
      {
        id: "cn-3",
        channel: "SAFETY_DESK",
        body: "Called rider — voice shaky. Vehicle still moving on Faisal. Will recheck in 2 min.",
        author: "Safety Desk · Ali",
        createdAt: minutesAgo(3),
        attachments: []
      }
    ],
    timeline: [
      { id: "t1", at: minutesAgo(8), label: "SOS triggered", note: "Panic button" },
      { id: "t2", at: minutesAgo(7), label: "Location shared with Safety Center" },
      { id: "t3", at: minutesAgo(5), label: "Emergency contacts notified (mock)" }
    ]
  },
  {
    id: "sos-2",
    code: "SOS-2402",
    status: "ACKNOWLEDGED",
    trigger: "ROUTE_DEVIATION",
    city: "Lahore",
    severity: "HIGH",
    reportedAt: minutesAgo(25),
    acknowledgedAt: minutesAgo(18),
    location: {
      lat: 31.5204,
      lng: 74.3587,
      label: "Canal Road near Thokar",
      updatedAt: minutesAgo(3)
    },
    trip: {
      id: "trip-902",
      rideId: "RIDE-77890",
      riderName: "Bilal Ahmed",
      riderPhone: "+92 333 9988776",
      driverName: "Usman Raza",
      driverPhone: "+92 300 5566778",
      vehiclePlate: "LHR-2190",
      pickup: "Johar Town",
      dropoff: "Gulberg III",
      status: "IN_PROGRESS",
      startedAt: minutesAgo(50),
      fareEstimate: 920
    },
    notes: "Route deviation > 2km from expected path. Agent acknowledged.",
    caseNotes: [
      {
        id: "cn-4",
        channel: "SAFETY_DESK",
        body: "Spoke to driver — road closure on main route. Sharing photo of diversion board.",
        author: "Safety Desk · Sara",
        createdAt: minutesAgo(15),
        attachments: [
          {
            id: "att-1",
            name: "diversion-ss.jpg",
            kind: "SCREENSHOT",
            url: "#",
            sizeLabel: "240 KB"
          }
        ]
      }
    ],
    timeline: [
      { id: "t1", at: minutesAgo(25), label: "Auto SOS — route deviation" },
      { id: "t2", at: minutesAgo(18), label: "Acknowledged by ops", note: "Admin preview" }
    ]
  },
  {
    id: "sos-3",
    code: "SOS-2398",
    status: "RESOLVED",
    trigger: "LONG_STOP",
    city: "Islamabad",
    severity: "MEDIUM",
    reportedAt: hoursAgo(5),
    acknowledgedAt: hoursAgo(4.8),
    resolvedAt: hoursAgo(4.2),
    location: {
      lat: 33.6844,
      lng: 73.0479,
      label: "Blue Area parking",
      updatedAt: hoursAgo(4.2)
    },
    trip: {
      id: "trip-880",
      rideId: "RIDE-77102",
      riderName: "Sara Malik",
      riderPhone: "+92 345 1122334",
      driverName: "Hassan Mir",
      driverPhone: "+92 312 6677889",
      vehiclePlate: "ISB-9033",
      pickup: "F-7 Markaz",
      dropoff: "G-11",
      status: "COMPLETED",
      startedAt: hoursAgo(6),
      fareEstimate: 650
    },
    notes: "Long stop cleared after traffic jam confirmation.",
    caseNotes: [],
    timeline: [
      { id: "t1", at: hoursAgo(5), label: "Long stop alert" },
      { id: "t2", at: hoursAgo(4.8), label: "Acknowledged" },
      { id: "t3", at: hoursAgo(4.2), label: "Resolved — false concern" }
    ]
  },
  {
    id: "sos-4",
    code: "SOS-2395",
    status: "FALSE_ALARM",
    trigger: "MANUAL_REPORT",
    city: "Karachi",
    severity: "LOW",
    reportedAt: hoursAgo(28),
    acknowledgedAt: hoursAgo(27.5),
    resolvedAt: hoursAgo(27),
    location: {
      lat: 24.9056,
      lng: 67.0822,
      label: "Gulshan-e-Iqbal",
      updatedAt: hoursAgo(27)
    },
    trip: {
      id: "trip-850",
      rideId: "RIDE-76901",
      riderName: "Omar Farooq",
      riderPhone: "+92 301 2233445",
      driverName: "Nadeem Shah",
      driverPhone: "+92 322 3344556",
      vehiclePlate: "KHI-1188",
      pickup: "North Nazimabad",
      dropoff: "PECHS",
      status: "COMPLETED",
      startedAt: hoursAgo(29),
      fareEstimate: 540
    },
    notes: "Rider cancelled SOS — accidental press.",
    caseNotes: [],
    timeline: [
      { id: "t1", at: hoursAgo(28), label: "Manual report" },
      { id: "t2", at: hoursAgo(27), label: "Marked false alarm" }
    ]
  },
  {
    id: "sos-5",
    code: "SOS-2403",
    status: "ACTIVE",
    trigger: "AUTO_CRASH",
    city: "Faisalabad",
    severity: "CRITICAL",
    reportedAt: minutesAgo(3),
    location: {
      lat: 31.4504,
      lng: 73.135,
      label: "Jaranwala Road",
      updatedAt: minutesAgo(0.5)
    },
    trip: {
      id: "trip-910",
      rideId: "RIDE-77910",
      riderName: "Hina Qureshi",
      riderPhone: "+92 334 5566778",
      driverName: "Tariq Mehmood",
      driverPhone: "+92 300 7788990",
      vehiclePlate: "FSD-4412",
      pickup: "D Ground",
      dropoff: "Susan Road",
      status: "IN_PROGRESS",
      startedAt: minutesAgo(20),
      fareEstimate: 410
    },
    notes: "Device motion suggested impact. Verify with rider/driver ASAP.",
    caseNotes: [],
    timeline: [
      { id: "t1", at: minutesAgo(3), label: "Auto crash detection" },
      { id: "t2", at: minutesAgo(2), label: "Location lock acquired" }
    ]
  }
];

export const emergencyContactsSeed: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "Ali Khan",
    phone: "+92 300 1010101",
    relation: "FAMILY",
    userName: "Ayesha Khan",
    userRole: "RIDER",
    isPrimary: true,
    createdAt: hoursAgo(240)
  },
  {
    id: "ec-2",
    name: "Nadia Ali",
    phone: "+92 321 2020202",
    relation: "SPOUSE",
    userName: "Imran Ali",
    userRole: "DRIVER",
    isPrimary: true,
    createdAt: hoursAgo(180)
  },
  {
    id: "ec-3",
    name: "Zain Malik",
    phone: "+92 333 3030303",
    relation: "FRIEND",
    userName: "Bilal Ahmed",
    userRole: "RIDER",
    isPrimary: false,
    createdAt: hoursAgo(90)
  },
  {
    id: "ec-4",
    name: "Fatima Raza",
    phone: "+92 345 4040404",
    relation: "FAMILY",
    userName: "Usman Raza",
    userRole: "DRIVER",
    isPrimary: true,
    createdAt: hoursAgo(60)
  }
];

export const emergencyServicesSeed: EmergencyService[] = [
  {
    id: "es-1",
    name: "City Police Helpline",
    type: "POLICE",
    phone: "15",
    city: "Karachi",
    available24h: true,
    notes: "Primary police dispatch"
  },
  {
    id: "es-2",
    name: "Edhi Ambulance",
    type: "AMBULANCE",
    phone: "115",
    city: "Karachi",
    available24h: true
  },
  {
    id: "es-3",
    name: "Rescue 1122",
    type: "AMBULANCE",
    phone: "1122",
    city: "Lahore",
    available24h: true
  },
  {
    id: "es-4",
    name: "Civil Defence / Fire",
    type: "FIRE",
    phone: "16",
    city: "Islamabad",
    available24h: true
  },
  {
    id: "es-5",
    name: "TP Roadside Assist",
    type: "ROADSIDE",
    phone: "+92 21 111000111",
    city: "Nationwide",
    available24h: false,
    notes: "Mock partner roadside"
  }
];

export const incidentReportsSeed: IncidentReport[] = [
  {
    id: "ir-1",
    incidentId: "sos-3",
    incidentCode: "SOS-2398",
    title: "Long stop — traffic confirmation",
    summary: "Ops verified traffic jam via driver call. No safety issue.",
    reportedBy: "Ops Admin",
    city: "Islamabad",
    status: "CLOSED",
    createdAt: hoursAgo(5),
    closedAt: hoursAgo(4)
  },
  {
    id: "ir-2",
    incidentId: "sos-4",
    incidentCode: "SOS-2395",
    title: "Accidental SOS press",
    summary: "Rider confirmed accidental panic button press.",
    reportedBy: "Safety Desk",
    city: "Karachi",
    status: "CLOSED",
    createdAt: hoursAgo(28),
    closedAt: hoursAgo(27)
  },
  {
    id: "ir-3",
    incidentId: "sos-2",
    incidentCode: "SOS-2402",
    title: "Route deviation review",
    summary: "Driver took alternate route due to road closure. Under review.",
    reportedBy: "Ops Admin",
    city: "Lahore",
    status: "UNDER_REVIEW",
    createdAt: minutesAgo(20)
  },
  {
    id: "ir-4",
    incidentId: "sos-1",
    incidentCode: "SOS-2401",
    title: "Active panic — initial report",
    summary: "Opened automatically when SOS was triggered.",
    reportedBy: "System",
    city: "Karachi",
    status: "OPEN",
    createdAt: minutesAgo(8)
  }
];

export const safetySettingsSeed: SafetySettings = {
  autoShareLocation: true,
  panicButtonEnabled: true,
  shareTripWithContacts: true,
  notifyEmergencyContacts: true,
  autoAlertOnRouteDeviation: true,
  longStopMinutes: 10,
  sosCooldownSeconds: 30
};

export function getSafetyOverviewStats(incidents: SosIncident[]) {
  const active = incidents.filter((i) => i.status === "ACTIVE" || i.status === "ACKNOWLEDGED");
  const resolvedToday = incidents.filter((i) => {
    if (!i.resolvedAt) return false;
    const d = new Date(i.resolvedAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });
  return {
    activeCount: active.length,
    criticalCount: incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED" && i.status !== "FALSE_ALARM").length,
    resolvedToday: resolvedToday.length,
    total: incidents.length
  };
}
