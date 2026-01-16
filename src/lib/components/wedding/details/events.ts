export interface WeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  dressCode?: string;
  note?: string;
  highlights?: string[];
  mapUrl?: string;
}

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'welcome',
    title: 'Welcome Dinner',
    date: 'January 20th, 2026',
    time: '10:00 AM',
    venue: 'The Grand Parampara',
    address: 'PTS Mana, Chowk, Dharampura Rd, Raipur, Chhattisgarh, Pincode - 492101',
    dressCode: 'Casual',
    highlights: ['Breakfast & drinks', 'Meet & greet', 'Warm welcomes'],
    mapUrl: 'https://maps.app.goo.gl/51ZwLe2rd4s86kuS9',
  },
  {
    id: 'Phoolon ki holi',
    title: 'Phoolon ki holi',
    date: 'January 20th, 2026',
    time: "5:00 PM",
    venue: 'The Grand Parampara',
    address: 'PTS Mana, Chowk, Dharampura Rd, Raipur, Chhattisgarh, Pincode - 492101',
    dressCode: 'Casual',
    highlights: ['Tea & snacks', 'Fun activities', 'Holi games'],
    mapUrl: 'https://maps.app.goo.gl/51ZwLe2rd4s86kuS9',
  },
  {
    id: 'Mandwa',
    title: 'Mandwa',
    date: 'January 21st, 2026',
    time: '10:00 AM',
    venue: 'The Grand Parampara',
    address: 'PTS Mana, Chowk, Dharampura Rd, Raipur, Chhattisgarh, Pincode - 492101',
    dressCode: 'Semi-formal',
    highlights: ['Breakfast & drinks', 'Ganpati Pooja'],
    mapUrl: 'https://maps.app.goo.gl/51ZwLe2rd4s86kuS9',
  },
  {
    id: 'Dandiya Night',
    title: 'Dandiya Night',
    date: 'January 1, 2026',
    time: '11:00 AM',
    venue: 'The Grand Parampara',
    address: 'PTS Mana, Chowk, Dharampura Rd, Raipur, Chhattisgarh, Pincode - 492101',
    dressCode: 'Traditional / Semi-formal',
    highlights: ['Dinner & drinks', 'Dandiya', 'Fun activities'],
    mapUrl: 'https://maps.app.goo.gl/51ZwLe2rd4s86kuS9',
  },
  {
    id: 'Reception',
    title: 'Reception',
    date: 'January 24th, 2026',
    time: '7:00 PM',
    venue: 'The Grand Parampara',
    address: 'PTS Mana, Chowk, Dharampura Rd, Raipur, Chhattisgarh, Pincode - 492101',
    dressCode: 'Formal / Semi-formal',
    highlights: ['Dinner & drinks', 'Music band', 'Photo booth'],
    mapUrl: 'https://maps.app.goo.gl/51ZwLe2rd4s86kuS9',
  }
];

