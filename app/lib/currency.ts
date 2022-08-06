// https://gist.github.com/Fluidbyte/2973986

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  rounding: number;
}

export const currencies: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  { code: "EUR", symbol: "€", name: "Euro", rounding: 0, decimalDigits: 2 },
  {
    code: "AED",
    symbol: "AED",
    name: "United Arab Emirates Dirham",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "AFN",
    symbol: "Af",
    name: "Afghan Afghani",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ALL",
    symbol: "ALL",
    name: "Albanian Lek",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "AMD",
    symbol: "AMD",
    name: "Armenian Dram",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ARS",
    symbol: "AR$",
    name: "Argentine Peso",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "AUD",
    symbol: "AU$",
    name: "Australian Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "AZN",
    symbol: "man.",
    name: "Azerbaijani Manat",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BAM",
    symbol: "KM",
    name: "Bosnia-Herzegovina Convertible Mark",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BDT",
    symbol: "Tk",
    name: "Bangladeshi Taka",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BGN",
    symbol: "BGN",
    name: "Bulgarian Lev",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BHD",
    symbol: "BD",
    name: "Bahraini Dinar",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "BIF",
    symbol: "FBu",
    name: "Burundian Franc",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "BND",
    symbol: "BN$",
    name: "Brunei Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BOB",
    symbol: "Bs",
    name: "Bolivian Boliviano",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BWP",
    symbol: "BWP",
    name: "Botswanan Pula",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BYN",
    symbol: "Br",
    name: "Belarusian Ruble",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "BZD",
    symbol: "BZ$",
    name: "Belize Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "CDF",
    symbol: "CDF",
    name: "Congolese Franc",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    rounding: 0.05,
    decimalDigits: 2,
  },
  {
    code: "CLP",
    symbol: "CL$",
    name: "Chilean Peso",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "CNY",
    symbol: "CN¥",
    name: "Chinese Yuan",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "COP",
    symbol: "CO$",
    name: "Colombian Peso",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "CRC",
    symbol: "₡",
    name: "Costa Rican Colón",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "CVE",
    symbol: "CV$",
    name: "Cape Verdean Escudo",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "CZK",
    symbol: "Kč",
    name: "Czech Republic Koruna",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "DJF",
    symbol: "Fdj",
    name: "Djiboutian Franc",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "DKK",
    symbol: "Dkr",
    name: "Danish Krone",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "DOP",
    symbol: "RD$",
    name: "Dominican Peso",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "DZD",
    symbol: "DA",
    name: "Algerian Dinar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "EEK",
    symbol: "Ekr",
    name: "Estonian Kroon",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "EGP",
    symbol: "EGP",
    name: "Egyptian Pound",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "ERN",
    symbol: "Nfk",
    name: "Eritrean Nakfa",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "ETB",
    symbol: "Br",
    name: "Ethiopian Birr",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound Sterling",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "GEL",
    symbol: "GEL",
    name: "Georgian Lari",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "GHS",
    symbol: "GH₵",
    name: "Ghanaian Cedi",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "GNF",
    symbol: "FG",
    name: "Guinean Franc",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "GTQ",
    symbol: "GTQ",
    name: "Guatemalan Quetzal",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "HNL",
    symbol: "HNL",
    name: "Honduran Lempira",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "HRK",
    symbol: "kn",
    name: "Croatian Kuna",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "HUF",
    symbol: "Ft",
    name: "Hungarian Forint",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ILS",
    symbol: "₪",
    name: "Israeli New Sheqel",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "INR",
    symbol: "Rs",
    name: "Indian Rupee",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "IQD",
    symbol: "IQD",
    name: "Iraqi Dinar",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "IRR",
    symbol: "IRR",
    name: "Iranian Rial",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ISK",
    symbol: "Ikr",
    name: "Icelandic Króna",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "JMD",
    symbol: "J$",
    name: "Jamaican Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "JOD",
    symbol: "JD",
    name: "Jordanian Dinar",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "KES",
    symbol: "Ksh",
    name: "Kenyan Shilling",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "KHR",
    symbol: "KHR",
    name: "Cambodian Riel",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "KMF",
    symbol: "CF",
    name: "Comorian Franc",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "KWD",
    symbol: "KD",
    name: "Kuwaiti Dinar",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "KZT",
    symbol: "KZT",
    name: "Kazakhstani Tenge",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "LBP",
    symbol: "L.L.",
    name: "Lebanese Pound",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "LKR",
    symbol: "SLRs",
    name: "Sri Lankan Rupee",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "LTL",
    symbol: "Lt",
    name: "Lithuanian Litas",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "LVL",
    symbol: "Ls",
    name: "Latvian Lats",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "LYD",
    symbol: "LD",
    name: "Libyan Dinar",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "MAD",
    symbol: "MAD",
    name: "Moroccan Dirham",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MDL",
    symbol: "MDL",
    name: "Moldovan Leu",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MGA",
    symbol: "MGA",
    name: "Malagasy Ariary",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "MKD",
    symbol: "MKD",
    name: "Macedonian Denar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MMK",
    symbol: "MMK",
    name: "Myanma Kyat",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "MOP",
    symbol: "MOP$",
    name: "Macanese Pataca",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MUR",
    symbol: "MURs",
    name: "Mauritian Rupee",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "MXN",
    symbol: "MX$",
    name: "Mexican Peso",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "MZN",
    symbol: "MTn",
    name: "Mozambican Metical",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NAD",
    symbol: "N$",
    name: "Namibian Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NIO",
    symbol: "C$",
    name: "Nicaraguan Córdoba",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NOK",
    symbol: "Nkr",
    name: "Norwegian Krone",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NPR",
    symbol: "NPRs",
    name: "Nepalese Rupee",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "OMR",
    symbol: "OMR",
    name: "Omani Rial",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "PAB",
    symbol: "B/.",
    name: "Panamanian Balboa",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "PEN",
    symbol: "S/.",
    name: "Peruvian Nuevo Sol",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "PKR",
    symbol: "PKRs",
    name: "Pakistani Rupee",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "PLN",
    symbol: "zł",
    name: "Polish Zloty",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "PYG",
    symbol: "₲",
    name: "Paraguayan Guarani",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "QAR",
    symbol: "QR",
    name: "Qatari Rial",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "RON",
    symbol: "RON",
    name: "Romanian Leu",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "RSD",
    symbol: "din.",
    name: "Serbian Dinar",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "RUB",
    symbol: "RUB",
    name: "Russian Ruble",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "RWF",
    symbol: "RWF",
    name: "Rwandan Franc",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "SAR",
    symbol: "SR",
    name: "Saudi Riyal",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "SDG",
    symbol: "SDG",
    name: "Sudanese Pound",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "SEK",
    symbol: "Skr",
    name: "Swedish Krona",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "SOS",
    symbol: "Ssh",
    name: "Somali Shilling",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "SYP",
    symbol: "SY£",
    name: "Syrian Pound",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "TND",
    symbol: "DT",
    name: "Tunisian Dinar",
    rounding: 0,
    decimalDigits: 3,
  },
  {
    code: "TOP",
    symbol: "T$",
    name: "Tongan Paʻanga",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "TRY",
    symbol: "TL",
    name: "Turkish Lira",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "TTD",
    symbol: "TT$",
    name: "Trinidad and Tobago Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "TWD",
    symbol: "NT$",
    name: "New Taiwan Dollar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "UAH",
    symbol: "₴",
    name: "Ukrainian Hryvnia",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "UGX",
    symbol: "USh",
    name: "Ugandan Shilling",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "UYU",
    symbol: "$U",
    name: "Uruguayan Peso",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "UZS",
    symbol: "UZS",
    name: "Uzbekistan Som",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "VEF",
    symbol: "Bs.F.",
    name: "Venezuelan Bolívar",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "VND",
    symbol: "₫",
    name: "Vietnamese Dong",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "XAF",
    symbol: "FCFA",
    name: "CFA Franc BEAC",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "XOF",
    symbol: "CFA",
    name: "CFA Franc BCEAO",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "YER",
    symbol: "YR",
    name: "Yemeni Rial",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    rounding: 0,
    decimalDigits: 2,
  },
  {
    code: "ZMK",
    symbol: "ZK",
    name: "Zambian Kwacha",
    rounding: 0,
    decimalDigits: 0,
  },
  {
    code: "ZWL",
    symbol: "ZWL$",
    name: "Zimbabwean Dollar",
    rounding: 0,
    decimalDigits: 0,
  },
];
export function getCurrencySymbol(currency?: string) {
  if (!currency) return "";
  const symbol = currencies.find((c) => c.code === currency)?.symbol;
  if (!symbol) {
    return currency;
  }
  return symbol;
}
