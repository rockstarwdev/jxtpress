export default (db, core) => {

    var out = [
        {title : 'Afghan Afghani', value : 'AFN'},
        {title : 'Albanian Lek', value : 'ALL'},
        {title : 'Algerian Dinar', value : 'DZD'},
        {title : 'Angolan Kwanza', value : 'AOA'},
        {title : 'Argentine Peso', value : 'ARS'},
        {title : 'Armenian Dram', value : 'AMD'},
        {title : 'Aruban Florin', value : 'AWG'},
        {title : 'Australian Dollar', value : 'AUD'},
        {title : 'Azerbaijani Manat', value : 'AZN'},
        {title : 'Bahamian Dollar', value : 'BSD'},
        {title : 'Bangladeshi Taka', value : 'BDT'},
        {title : 'Barbadian Dollar', value : 'BBD'},
        {title : 'Belize Dollar', value : 'BZD'},
        {title : 'Bermudian Dollar', value : 'BMD'},
        {title : 'Bolivian Boliviano', value : 'BOB'},
        {title : 'Bosnia & Herzegovina Convertible Mark', value : 'BAM'},
        {title : 'Botswana Pula', value : 'BWP'},
        {title : 'Brazilian Real', value : 'BRL'},
        {title : 'British Pound', value : 'GBP'},
        {title : 'Brunei Dollar', value : 'BND'},
        {title : 'Bulgarian Lev', value : 'BGN'},
        {title : 'Burundian Franc', value : 'BIF'},
        {title : 'Cambodian Riel', value : 'KHR'},
        {title : 'Canadian Dollar', value : 'CAD'},
        {title : 'Cape Verdean Escudo', value : 'CVE'},
        {title : 'Cayman Islands Dollar', value : 'KYD'},
        {title : 'Central African Cfa Franc', value : 'XAF'},
        {title : 'Cfp Franc', value : 'XPF'},
        {title : 'Chilean Peso', value : 'CLP'},
        {title : 'Chinese Renminbi Yuan', value : 'CNY'},
        {title : 'Colombian Peso', value : 'COP'},
        {title : 'Comorian Franc', value : 'KMF'},
        {title : 'Congolese Franc', value : 'CDF'},
        {title : 'Costa Rican Colón', value : 'CRC'},
        {title : 'Croatian Kuna', value : 'HRK'},
        {title : 'Czech Koruna', value : 'CZK'},
        {title : 'Danish Krone', value : 'DKK'},
        {title : 'Djiboutian Franc', value : 'DJF'},
        {title : 'Dominican Peso', value : 'DOP'},
        {title : 'East Caribbean Dollar', value : 'XCD'},
        {title : 'Egyptian Pound', value : 'EGP'},
        {title : 'Ethiopian Birr', value : 'ETB'},
        {title : 'Euro', value : 'EUR'},
        {title : 'Falkland Islands Pound', value : 'FKP'},
        {title : 'Fijian Dollar', value : 'FJD'},
        {title : 'Gambian Dalasi', value : 'GMD'},
        {title : 'Georgian Lari', value : 'GEL'},
        {title : 'Gibraltar Pound', value : 'GIP'},
        {title : 'Guatemalan Quetzal', value : 'GTQ'},
        {title : 'Guinean Franc', value : 'GNF'},
        {title : 'Guyanese Dollar', value : 'GYD'},
        {title : 'Haitian Gourde', value : 'HTG'},
        {title : 'Honduran Lempira', value : 'HNL'},
        {title : 'Hong Kong Dollar', value : 'HKD'},
        {title : 'Hungarian Forint', value : 'HUF'},
        {title : 'Icelandic Króna', value : 'ISK'},
        {title : 'Indian Rupee', value : 'INR'},
        {title : 'Indonesian Rupiah', value : 'IDR'},
        {title : 'Israeli New Sheqel', value : 'ILS'},
        {title : 'Jamaican Dollar', value : 'JMD'},
        {title : 'Japanese Yen', value : 'JPY'},
        {title : 'Kazakhstani Tenge', value : 'KZT'},
        {title : 'Kenyan Shilling', value : 'KES'},
        {title : 'Kyrgyzstani Som', value : 'KGS'},
        {title : 'Lao Kip', value : 'LAK'},
        {title : 'Lebanese Pound', value : 'LBP'},
        {title : 'Lesotho Loti', value : 'LSL'},
        {title : 'Liberian Dollar', value : 'LRD'},
        {title : 'Macanese Pataca', value : 'MOP'},
        {title : 'Macedonian Denar', value : 'MKD'},
        {title : 'Malagasy Ariary', value : 'MGA'},
        {title : 'Malawian Kwacha', value : 'MWK'},
        {title : 'Malaysian Ringgit', value : 'MYR'},
        {title : 'Maldivian Rufiyaa', value : 'MVR'},
        {title : 'Mauritanian Ouguiya', value : 'MRO'},
        {title : 'Mauritian Rupee', value : 'MUR'},
        {title : 'Mexican Peso', value : 'MXN'},
        {title : 'Moldovan Leu', value : 'MDL'},
        {title : 'Mongolian Tögrög', value : 'MNT'},
        {title : 'Moroccan Dirham', value : 'MAD'},
        {title : 'Mozambican Metical', value : 'MZN'},
        {title : 'Myanmar Kyat', value : 'MMK'},
        {title : 'Namibian Dollar', value : 'NAD'},
        {title : 'Nepalese Rupee', value : 'NPR'},
        {title : 'Netherlands Antillean Gulden', value : 'ANG'},
        {title : 'New Taiwan Dollar', value : 'TWD'},
        {title : 'New Zealand Dollar', value : 'NZD'},
        {title : 'Nicaraguan Córdoba', value : 'NIO'},
        {title : 'Nigerian Naira', value : 'NGN'},
        {title : 'Norwegian Krone', value : 'NOK'},
        {title : 'Pakistani Rupee', value : 'PKR'},
        {title : 'Panamanian Balboa', value : 'PAB'},
        {title : 'Papua New Guinean Kina', value : 'PGK'},
        {title : 'Paraguayan Guaraní', value : 'PYG'},
        {title : 'Peruvian Nuevo Sol', value : 'PEN'},
        {title : 'Philippine Peso', value : 'PHP'},
        {title : 'Polish Złoty', value : 'PLN'},
        {title : 'Qatari Riyal', value : 'QAR'},
        {title : 'Romanian Leu', value : 'RON'},
        {title : 'Russian Ruble', value : 'RUB'},
        {title : 'Rwandan Franc', value : 'RWF'},
        {title : 'São Tomé and Príncipe Dobra', value : 'STD'},
        {title : 'Saint Helenian Pound', value : 'SHP'},
        {title : 'Salvadoran Colón', value : 'SVC'},
        {title : 'Samoan Tala', value : 'WST'},
        {title : 'Saudi Riyal', value : 'SAR'},
        {title : 'Serbian Dinar', value : 'RSD'},
        {title : 'Seychellois Rupee', value : 'SCR'},
        {title : 'Sierra Leonean Leone', value : 'SLL'},
        {title : 'Singapore Dollar', value : 'SGD'},
        {title : 'Solomon Islands Dollar', value : 'SBD'},
        {title : 'Somali Shilling', value : 'SOS'},
        {title : 'South African Rand', value : 'ZAR'},
        {title : 'South Korean Won', value : 'KRW'},
        {title : 'Sri Lankan Rupee', value : 'LKR'},
        {title : 'Surinamese Dollar', value : 'SRD'},
        {title : 'Swazi Lilangeni', value : 'SZL'},
        {title : 'Swedish Krona', value : 'SEK'},
        {title : 'Swiss Franc', value : 'CHF'},
        {title : 'Tajikistani Somoni', value : 'TJS'},
        {title : 'Tanzanian Shilling', value : 'TZS'},
        {title : 'Thai Baht', value : 'THB'},
        {title : 'Tongan Paʻanga', value : 'TOP'},
        {title : 'Trinidad and Tobago Dollar', value : 'TTD'},
        {title : 'Turkish Lira', value : 'TRY'},
        {title : 'Ugandan Shilling', value : 'UGX'},
        {title : 'Ukrainian Hryvnia', value : 'UAH'},
        {title : 'United Arab Emirates Dirham', value : 'AED'},
        {title : 'United States Dollar', value : 'USD'},
        {title : 'Uruguayan Peso', value : 'UYU'},
        {title : 'Uzbekistani Som', value : 'UZS'},
        {title : 'Vanuatu Vatu', value : 'VUV'},
        {title : 'Vietnamese Đồng', value : 'VND'},
        {title : 'West African Cfa Franc', value : 'XOF'},
        {title : 'Yemeni Rial', value : 'YER'},
        {title : 'Zambian Kwacha', value : 'ZMW'},
      ]
      out.forEach(currency => currency.title = currency.title + ' - ' + currency.value )
      return out 
}
