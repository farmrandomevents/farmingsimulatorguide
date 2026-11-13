window.FSG_EVENT_CATEGORIES = window.FSG_EVENT_CATEGORIES || {};
window.FSG_EVENT_CATEGORIES[0] = [
  {
    "id": "weather-2026-01",
    "c": 0,
    "t": "Minor Flooding",
    "template": "Your smallest field is flooded. No fieldwork on that field for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood"
  },
  {
    "id": "weather-2026-02",
    "c": 0,
    "t": "Severe Flooding",
    "template": "Your largest field is flooded. No fieldwork on that field for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood"
  },
  {
    "id": "weather-2026-03",
    "c": 0,
    "t": "Widespread Flooding",
    "template": "All fields of {area10} or more are flooded. No fieldwork on those fields for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "flood"
  },
  {
    "id": "weather-2026-04",
    "c": 0,
    "t": "Heavy Rain",
    "template": "All fieldwork must stop for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "rain"
  },
  {
    "id": "weather-2026-05",
    "c": 0,
    "t": "Persistent Rain",
    "template": "Harvesting is suspended across your farm for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "harvest-weather"
  },
  {
    "id": "weather-2026-06",
    "c": 0,
    "t": "Wet Harvest",
    "template": "Delay harvesting your largest field for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "harvest-weather"
  },
  {
    "id": "weather-2026-07",
    "c": 0,
    "t": "High Winds",
    "template": "No crop spraying or fertiliser spreading for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "wind"
  },
  {
    "id": "weather-2026-08",
    "c": 0,
    "t": "Lightning Strike",
    "template": "Pay £500 for electrical or machinery repairs.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-09",
    "c": 0,
    "t": "Storm Damage",
    "template": "Pay £1,000 for farm repairs.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-10",
    "c": 0,
    "t": "Fallen Tree",
    "template": "Remove a fallen tree or pay £500 for clearance.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-11",
    "c": 0,
    "t": "Power Outage",
    "template": "Pause all production buildings for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days"
  },
  {
    "id": "weather-2026-12",
    "c": 0,
    "t": "Dust Storm",
    "template": "Harvesting is suspended for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "harvest-weather"
  },
  {
    "id": "weather-2026-13",
    "c": 0,
    "t": "Heatwave",
    "template": "No fieldwork between 12pm and 3pm for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "heat"
  },
  {
    "id": "weather-2026-14",
    "c": 0,
    "t": "Drought",
    "template": "No fertilising on your largest field until next month.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "months",
    "minMonths": 1,
    "maxMonths": 1
  },
  {
    "id": "weather-2026-15",
    "c": 0,
    "t": "Late Frost",
    "template": "Delay planting for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days",
    "conflictGroup": "frost"
  },
  {
    "id": "weather-2026-16",
    "c": 0,
    "t": "Early Frost",
    "template": "Harvest your smallest ready field before the frost causes problems.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-17",
    "c": 0,
    "t": "Dry Spell",
    "template": "No grass mowing for {duration}.",
    "p": "category-0",
    "eventType": "timed",
    "duration": "days"
  },
  {
    "id": "weather-2026-18",
    "c": 0,
    "t": "Exceptional Growing Conditions",
    "template": "Complete a harvesting or mowing contract and receive an additional £500 as a roleplay reward.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-19",
    "c": 0,
    "t": "Prolonged Sunshine",
    "template": "Your next grass harvest must be made into hay rather than silage.",
    "p": "category-0",
    "eventType": "action"
  },
  {
    "id": "weather-2026-20",
    "c": 0,
    "t": "Sudden Temperature Drop",
    "template": "Deliver one additional load of feed to every {animal} enclosure.",
    "p": "category-0",
    "eventType": "action",
    "conflictGroup": "cold-feed",
    "requiresAnimals": 1
  },
  {
    "id": "weather-2026-21",
    "c": 0,
    "t": "Severe Cold Weather",
    "template": "Deliver one additional load of feed to every livestock enclosure on your farm.",
    "p": "category-0",
    "eventType": "action",
    "conflictGroup": "cold-feed",
    "requiresAnimals": 3
  }
];
