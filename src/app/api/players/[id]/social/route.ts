import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/players/[id]/social - Datos de redes sociales
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataPath = path.join(process.cwd(), "src", "data", `${id}-complete.json`);

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404, headers: corsHeaders });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const social = data.social;

    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || "all";

    if (platform === "twitter") {
      return NextResponse.json({
        success: true,
        platform: "twitter",
        data: social.twitter,
      }, { headers: corsHeaders });
    }

    if (platform === "instagram") {
      return NextResponse.json({
        success: true,
        platform: "instagram",
        data: social.instagram,
      }, { headers: corsHeaders });
    }

    // All platforms
    return NextResponse.json({
      success: true,
      totalReach: social.totalReach,
      engagementRate: social.engagementRate || social.overallEngagement,
      platforms: {
        twitter: {
          handle: social.twitter.handle,
          followers: social.twitter.followers,
          following: social.twitter.following,
          tweets: social.twitter.tweets,
          sentiment: social.twitter.recentMentions?.sentiment || social.twitter.sentiment,
          recentMentions: social.twitter.topMentions || social.twitter.recentMentions,
        },
        instagram: {
          handle: social.instagram.handle,
          followers: social.instagram.followers,
          posts: social.instagram.posts,
          avgLikes: social.instagram.avgLikes,
          avgComments: social.instagram.avgComments,
          recentPosts: social.instagram.recentPosts,
        },
      },
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load social data" }, { status: 500, headers: corsHeaders });
  }
}
