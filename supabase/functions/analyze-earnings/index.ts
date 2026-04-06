import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, quarter, transcript, transcript_url, ppt_url, transcript_date } = await req.json();

    if (!company_id || !quarter || !transcript) {
      return new Response(JSON.stringify({ error: "company_id, quarter, and transcript are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert equity research analyst specializing in Indian markets. Analyze the following earnings call transcript and return a JSON object with these exact fields:

{
  "summary": "2-3 paragraph executive summary of the earnings call",
  "investment_signal": "BUY or HOLD or SELL",
  "signal_rationale": "2-3 sentence explanation of the investment signal",
  "key_numbers": [{"metric": "...", "value": "...", "context": "..."}],
  "key_takeaways": ["takeaway1", "takeaway2", ...],
  "revenue_analysis": {"current": "...", "growth": "...", "drivers": "...", "concerns": "..."},
  "margin_analysis": {"ebitda_margin": "...", "pat_margin": "...", "trend": "...", "drivers": "..."},
  "guidance": {"revenue_outlook": "...", "margin_outlook": "...", "capex_plans": "...", "confidence_level": "High/Medium/Low"},
  "risks": ["risk1", "risk2", ...],
  "green_flags": ["flag1", "flag2", ...],
  "red_flags": ["flag1", "flag2", ...],
  "sentiment_score": 0.0 to 1.0,
  "sentiment_label": "Bullish/Neutral/Bearish",
  "sentiment_components": {"management_tone": 0.0-1.0, "forward_guidance": 0.0-1.0, "financial_performance": 0.0-1.0},
  "bull_case": "paragraph describing the bull case",
  "bear_case": "paragraph describing the bear case",
  "mgmt_tone": "Confident/Cautious/Defensive/Aggressive",
  "mgmt_confidence": 0.0 to 1.0,
  "tone_evidence": ["quote or observation 1", "quote or observation 2", ...],
  "dodged_questions": ["question1", "question2", ...],
  "next_quarter_watchlist": ["item1", "item2", ...]
}

Return ONLY valid JSON, no markdown formatting.`;

    console.log(`Analyzing transcript for ${quarter}...`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this earnings call transcript:\n\n${transcript.substring(0, 80000)}` },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "AI analysis failed", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(JSON.stringify({ error: "No content from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response (strip markdown code fences if present)
    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content.substring(0, 1000) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from("earnings_analyses").insert({
      company_id,
      quarter,
      transcript_date: transcript_date || null,
      summary: analysis.summary,
      investment_signal: analysis.investment_signal,
      signal_rationale: analysis.signal_rationale,
      key_numbers: analysis.key_numbers,
      key_takeaways: analysis.key_takeaways,
      revenue_analysis: analysis.revenue_analysis,
      margin_analysis: analysis.margin_analysis,
      guidance: analysis.guidance,
      risks: analysis.risks,
      green_flags: analysis.green_flags,
      red_flags: analysis.red_flags,
      sentiment_score: analysis.sentiment_score,
      sentiment_label: analysis.sentiment_label,
      sentiment_components: analysis.sentiment_components,
      bull_case: analysis.bull_case,
      bear_case: analysis.bear_case,
      mgmt_tone: analysis.mgmt_tone,
      mgmt_confidence: analysis.mgmt_confidence,
      tone_evidence: analysis.tone_evidence,
      dodged_questions: analysis.dodged_questions,
      next_quarter_watchlist: analysis.next_quarter_watchlist,
      transcript_url: transcript_url || null,
      ppt_url: ppt_url || null,
      raw_transcript: transcript.substring(0, 100000),
      analysis_model: "gemini-2.5-flash-preview",
    }).select().single();

    if (error) {
      console.error("DB insert error:", error);
      return new Response(JSON.stringify({ error: "DB insert failed", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analysis saved for ${quarter}, id: ${data.id}`);
    return new Response(JSON.stringify({ success: true, id: data.id, quarter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
