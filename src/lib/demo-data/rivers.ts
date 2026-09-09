import { River } from "../types";

export const rivers: River[] = [
  {
    id: "river-musi",
    name: "Musi",
    displayName: "Musi River",
    description: "Major river flowing through Hyderabad, severely polluted by industrial and domestic waste",
    region: "Telangana",
    healthScore: 68,
    healthStatus: "Fair",
  },
  {
    id: "river-ganga",
    name: "Ganga",
    displayName: "Ganga River",
    description: "India's holiest river, facing pollution challenges from multiple states",
    region: "Uttarakhand to West Bengal",
    healthScore: 52,
    healthStatus: "Poor",
  },
  {
    id: "river-yamuna",
    name: "Yamuna",
    displayName: "Yamuna River",
    description: "Major tributary of Ganga, heavily polluted in Delhi stretch",
    region: "Uttarakhand to Delhi",
    healthScore: 45,
    healthStatus: "Poor",
  },
  {
    id: "river-godavari",
    name: "Godavari",
    displayName: "Godavari River",
    description: "Second longest river in peninsular India, facing industrial pollution",
    region: "Maharashtra to Andhra Pradesh",
    healthScore: 72,
    healthStatus: "Fair",
  },
  {
    id: "river-krishna",
    name: "Krishna",
    displayName: "Krishna River",
    description: "Major river in South India, important for irrigation and drinking water",
    region: "Maharashtra to Andhra Pradesh",
    healthScore: 70,
    healthStatus: "Fair",
  },
  {
    id: "river-brahmaputra",
    name: "Brahmaputra",
    displayName: "Brahmaputra River",
    description: "One of the major rivers of Asia, flowing through Assam",
    region: "Arunachal Pradesh to Assam",
    healthScore: 78,
    healthStatus: "Good",
  },
];

export function getRiverById(id: string): River | undefined {
  return rivers.find((river) => river.id === id);
}
