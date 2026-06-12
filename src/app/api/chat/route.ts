import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, pgId, pgName, ownerName, price, safetyScore } = await request.json();
    const query = message.toLowerCase();
    
    // Default reply
    let reply = `Hello! Thanks for reaching out about ${pgName}. I'm ${ownerName.split(' ')[0]}, the owner. I would love to show you around. Let me know if you would like to schedule a visit! You can also call me directly.`;
    
    // Keyword-based smart replies
    if (query.includes('food') || query.includes('mess') || query.includes('menu') || query.includes('lunch') || query.includes('breakfast') || query.includes('dinner') || query.includes('meal')) {
      reply = `Hi! At ${pgName}, we take food quality very seriously. Our current student rating for the mess is quite high. You can view our full weekly breakfast, lunch, and dinner menu directly on the PG details card! Is there any specific dietary restriction you have?`;
    } else if (query.includes('price') || query.includes('rent') || query.includes('cost') || query.includes('charge') || query.includes('fee') || query.includes('money')) {
      reply = `Yes, the rent for ${pgName} is currently ₹${price} per month. This covers accommodation, water bills, common area cleaning, and internet. Electricity is charged as per usage (separate meter) or is sub-metered. Let me know if that fits your range!`;
    } else if (query.includes('safety') || query.includes('security') || query.includes('guard') || query.includes('cctv') || query.includes('safe') || query.includes('girls') || query.includes('camera')) {
      reply = `Safety is our absolute priority. ${pgName} has a safety score of ${safetyScore}/100. We have active CCTV surveillance, entry checks, and a security guard present. Our area is well-lit, making it safe for students returning late.`;
    } else if (query.includes('wifi') || query.includes('internet') || query.includes('ac') || query.includes('laundry') || query.includes('washing') || query.includes('gym')) {
      reply = `Regarding amenities, we have high-speed Wi-Fi throughout the building. Depending on your room choice, AC and laundry services are fully supported. You can check the exact amenities ticked green on our card listing page.`;
    } else if (query.includes('room') || query.includes('sharing') || query.includes('single') || query.includes('bed') || query.includes('double')) {
      reply = `We have both single occupancy and double sharing options available right now at ${pgName}. The rooms come furnished with a bed, wardrobe, study table, and chair. Would you like to schedule a call to finalize or view a room walk-around video?`;
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greetings')) {
      reply = `Hello! How can I help you today? Ask me anything about ${pgName}'s rent, safety facilities, weekly mess menu, or room sharing options!`;
    }
    
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
