import { NextResponse } from 'next/server';
import { readPgs, writePgs } from '@/lib/db';

export async function GET() {
  const pgs = await readPgs();
  return NextResponse.json(pgs);
}

export async function PUT(request: Request) {
  try {
    const updatedPg = await request.json();
    const pgs = await readPgs();
    const index = pgs.findIndex((p) => p.id === updatedPg.id);
    
    if (index !== -1) {
      // Retain existing reviews if not provided, or merge
      const mergedPg = {
        ...pgs[index],
        ...updatedPg,
        // If reviews are provided, use them; otherwise keep existing
        reviews: updatedPg.reviews ? updatedPg.reviews : pgs[index].reviews,
      };
      
      // Recalculate safety score based on breakdown, if updated
      if (updatedPg.safetyBreakdown) {
        const bd = updatedPg.safetyBreakdown;
        const score = Math.round(
          (bd.cctv + bd.guard + bd.streetlights + bd.emergency + bd.crimeRate) / 5
        );
        mergedPg.safetyScore = score;
      }

      pgs[index] = mergedPg;
      const success = await writePgs(pgs);
      
      if (!success) {
        return NextResponse.json({ success: false, error: 'Database write failed' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, pg: mergedPg });
    }
    
    return NextResponse.json({ success: false, error: 'PG not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Support adding review via POST /api/pgs
export async function POST(request: Request) {
  try {
    const { pgId, review, userRole } = await request.json();
    
    // Security check: only students can rate
    if (userRole !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Rating is restricted to verified students only.' },
        { status: 403 }
      );
    }
    
    const pgs = await readPgs();
    const index = pgs.findIndex((p) => p.id === pgId);
    
    if (index !== -1) {
      const newReview = {
        id: 'r-' + Date.now(),
        studentName: review.studentName || 'Anonymous Student',
        rating: Number(review.rating) || 5,
        comment: review.comment || '',
        date: new Date().toISOString().split('T')[0],
        verified: true // student is logged in and verified
      };
      
      pgs[index].reviews.unshift(newReview);
      
      const success = await writePgs(pgs);
      if (!success) {
        return NextResponse.json({ success: false, error: 'Database write failed' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, pg: pgs[index] });
    }
    
    return NextResponse.json({ success: false, error: 'PG not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
