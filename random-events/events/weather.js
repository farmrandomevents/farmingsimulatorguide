window.FSG_EVENT_CATEGORIES = window.FSG_EVENT_CATEGORIES || {};
window.FSG_EVENT_CATEGORIES[0] = [
  {
    "id": "weather-2026-01",
    "c": 0,
    "t": "Minor Flooding",
    "template": "Heavy overnight rainfall has left your smallest field waterlogged. The saturated ground is unsuitable for heavy machinery.\n\nACTION REQUIRED: Keep machinery off your smallest field for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood",
    "seasonMonths": [
      0,
      1,
      2,
      3,
      4,
      8,
      9,
      10,
      11
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-02",
    "c": 0,
    "t": "Severe Flooding",
    "template": "Prolonged rainfall has caused extensive flooding on your largest field. The ground will need time to recover.\n\nACTION REQUIRED: Suspend fieldwork on your largest field for 2 days.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood",
    "seasonMonths": [
      0,
      1,
      2,
      3,
      4,
      8,
      9,
      10,
      11
    ],
    "fixedDays": 2
  },
  {
    "id": "weather-2026-03",
    "c": 0,
    "t": "Widespread Flooding",
    "template": "Heavy rainfall has caused flooding across the local area. Some fields have become waterlogged and unsuitable for machinery.\n\nACTION REQUIRED: Suspend fieldwork on fields of {area10} or more for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood",
    "seasonMonths": [
      0,
      1,
      2,
      3,
      4,
      8,
      9,
      10,
      11
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-04",
    "c": 0,
    "t": "Heavy Rain",
    "template": "Heavy rain has left field conditions unsuitable for machinery and outdoor operations.\n\nACTION REQUIRED: Suspend all fieldwork for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "wet-weather",
    "fixedDays": 1
  },
  {
    "id": "weather-2026-05",
    "c": 0,
    "t": "Persistent Rain",
    "template": "Continued rainfall has left standing crops too wet to harvest.\n\nACTION REQUIRED: Suspend harvesting for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "wet-weather",
    "seasonMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-06",
    "c": 0,
    "t": "Wet Harvest",
    "template": "Persistent damp conditions have made harvesting difficult across the region. Farmers are being advised to wait for crops and ground conditions to improve.\n\nACTION REQUIRED: Suspend all harvesting for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "wet-weather",
    "seasonMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-07",
    "c": 0,
    "t": "High Winds",
    "template": "Strong winds are increasing the risk of spray drift and uneven fertiliser application.\n\nACTION REQUIRED: Suspend crop spraying and fertiliser spreading for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "wind",
    "fixedDays": 1
  },
  {
    "id": "weather-2026-08",
    "c": 0,
    "t": "Lightning Strike",
    "template": "A lightning strike has damaged electrical equipment at the farm. An electrician has been called to carry out repairs.\n\nACTION REQUIRED: Pay £500 for electrical repairs.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-09",
    "c": 0,
    "t": "Storm Damage",
    "template": "Overnight storms have damaged roofing and fittings around the farm. Repairs are needed to prevent further deterioration.\n\nACTION REQUIRED: Pay £1,000 for farm repairs.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-10",
    "c": 0,
    "t": "Fallen Tree",
    "template": "Strong winds have brought down a tree, obstructing an access route on the farm.\n\nACTION REQUIRED: Remove the fallen tree using suitable equipment or pay £500 for professional clearance.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-11",
    "c": 0,
    "t": "Power Outage",
    "template": "Storm damage has interrupted the electricity supply, leaving production facilities temporarily without power.\n\nACTION REQUIRED: Suspend all production activities for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "fixedDays": 1
  },
  {
    "id": "weather-2026-12",
    "c": 0,
    "t": "Dust Storm",
    "template": "Strong winds have lifted dry soil and dust into the air, significantly reducing visibility across the fields.\n\nACTION REQUIRED: Suspend harvesting for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "harvest-weather",
    "seasonMonths": [
      4,
      5,
      6,
      7,
      8
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-13",
    "c": 0,
    "t": "Heatwave",
    "template": "Exceptionally high temperatures have created difficult working conditions during the hottest part of the day.\n\nACTION REQUIRED: Suspend fieldwork between 12pm and 3pm today.",
    "p": "category-0",
    "eventType": "action",
    "conflictGroup": "heat",
    "seasonMonths": [
      5,
      6,
      7
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-14",
    "c": 0,
    "t": "Drought",
    "template": "A prolonged shortage of rainfall has left the soil extremely dry and difficult to cultivate.\n\nACTION REQUIRED: Suspend cultivation on your largest field for 1 month.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "months",
    "minMonths": 1,
    "maxMonths": 1,
    "seasonMonths": [
      4,
      5,
      6,
      7,
      8
    ]
  },
  {
    "id": "weather-2026-15",
    "c": 0,
    "t": "Late Frost",
    "template": "An unexpected late spring frost has been forecast, with temperatures expected to fall below freezing overnight. Newly planted crops may be vulnerable.\n\nACTION REQUIRED: Postpone all planting for 1 day.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "frost",
    "seasonMonths": [
      2,
      3,
      4
    ],
    "fixedDays": 1
  },
  {
    "id": "weather-2026-16",
    "c": 0,
    "t": "Early Frost",
    "template": "An unusually early frost has been forecast overnight. Farmers across the region are being advised to bring forward harvesting where crops are ready.\n\nACTION REQUIRED: Prioritise harvesting any crops that are ready before advancing to the next day.",
    "p": "category-0",
    "eventType": "action",
    "seasonMonths": [
      8,
      9,
      10
    ],
    "conflictGroup": "frost"
  },
  {
    "id": "weather-2026-17",
    "c": 0,
    "t": "Dry Spell",
    "template": "A settled period of dry weather has created excellent conditions for cutting and drying grass.\n\nOpportunity: If grass is ready, use your next grass harvest to produce hay.",
    "p": "category-0",
    "eventType": "action",
    "seasonMonths": [
      4,
      5,
      6,
      7,
      8
    ]
  },
  {
    "id": "weather-2026-18",
    "c": 0,
    "t": "Exceptional Growing Conditions",
    "template": "Mild temperatures and regular rainfall have provided excellent growing conditions. Crops across the farm are developing well.\n\nGood news: No action required.",
    "p": "category-0",
    "eventType": "info",
    "seasonMonths": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  {
    "id": "weather-2026-19",
    "c": 0,
    "t": "Prolonged Sunshine",
    "template": "Several days of warm sunshine have created ideal conditions for haymaking.\n\nOpportunity: Produce hay rather than silage from your next grass harvest, where possible.",
    "p": "category-0",
    "eventType": "action",
    "seasonMonths": [
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  {
    "id": "weather-2026-20",
    "c": 0,
    "t": "Sudden Temperature Drop",
    "template": "Temperatures have fallen sharply, bringing unusually cold conditions across the farm. Livestock housed indoors may require additional bedding.\n\nACTION REQUIRED: Check feed and water supplies in all occupied animal enclosures. Add 1 bale of straw to each enclosure that accepts straw bedding today.",
    "p": "category-0",
    "eventType": "action",
    "conflictGroup": "cold-livestock",
    "requiresAnimals": 1,
    "seasonMonths": [
      9,
      10,
      11,
      0,
      1,
      2
    ],
    "requiresStrawCompatibleAnimals": true
  },
  {
    "id": "weather-2026-21",
    "c": 0,
    "t": "Severe Cold Weather",
    "template": "A prolonged spell of freezing weather has increased livestock feed requirements. Water supplies may also be affected by freezing temperatures.\n\nACTION REQUIRED: Check feed and water supplies in all occupied animal enclosures. Arrange 1 additional feed delivery for each animal type you own today.",
    "p": "category-0",
    "eventType": "action",
    "conflictGroup": "cold-livestock",
    "requiresAnimals": 1,
    "seasonMonths": [
      11,
      0,
      1
    ]
  }
];
