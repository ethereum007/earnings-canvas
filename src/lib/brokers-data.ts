export interface Broker {
  name: string;
  analysts: number;
}

export const BROKERS: Broker[] = [
  { name: "ICICI Securities", analysts: 107 },
  { name: "Elara Capital", analysts: 102 },
  { name: "Nuvama Group", analysts: 91 },
  { name: "JM Financial", analysts: 84 },
  { name: "IIFL Securities", analysts: 76 },
  { name: "360 ONE Capital (B&K)", analysts: 73 },
  { name: "Antique Securities", analysts: 69 },
  { name: "Motilal Oswal", analysts: 66 },
  { name: "Emkay Global", analysts: 64 },
  { name: "Dolat Capital", analysts: 63 },
  { name: "Kotak Securities", analysts: 56 },
  { name: "Phillip Capital", analysts: 56 },
  { name: "Avendus Spark", analysts: 55 },
  { name: "Anand Rathi", analysts: 54 },
  { name: "Axis Capital", analysts: 52 },
  { name: "Ambit Broking", analysts: 51 },
  { name: "Nirmal Bang", analysts: 47 },
  { name: "Jefferies", analysts: 43 },
  { name: "Systematix", analysts: 42 },
  { name: "DAM Capital", analysts: 41 },
  { name: "Investec (India)", analysts: 41 },
  { name: "YES Securities", analysts: 41 },
  { name: "Equirus", analysts: 37 },
  { name: "Prabhudas Lilladher", analysts: 37 },
  { name: "Citigroup (India)", analysts: 36 },
  { name: "HDFC Securities", analysts: 34 },
  { name: "Nomura (India)", analysts: 32 },
  { name: "Arihant Capital Market", analysts: 30 },
  { name: "UBS (India)", analysts: 30 },
  { name: "SMIFS", analysts: 29 },
];

export const TOTAL_ANALYSTS = BROKERS.reduce((sum, b) => sum + b.analysts, 0);
