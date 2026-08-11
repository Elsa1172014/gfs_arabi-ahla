// Gemini API serverless endpoint
// The API key stays securely on Vercel as GEMINI_API_KEY.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY غير موجود في Vercel",
      details:
        "تأكد من إضافة GEMINI_API_KEY إلى Environment Variables ثم نفّذ Redeploy.",
    });
  }

  try {
    const {
      prompt,
      imageBase64,
      imageMediaType
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        error: "لم يتم إرسال prompt إلى Gemini",
      });
    }

    const parts = [];

    // Optional image
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: imageMediaType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    // Text prompt
    parts.push({
      text: String(prompt),
    });

    const model = "gemini-2.5-flash";

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        // Gemini API key
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],

        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
        },
      }),
    });

    const rawResponse = await response.text();

    let data;

    try {
      data = rawResponse
        ? JSON.parse(rawResponse)
        : {};
    } catch {
      data = {
        raw: rawResponse,
      };
    }

    // Google returned an error
    if (!response.ok) {
      const googleError =
        data?.error?.message ||
        data?.message ||
        (typeof data?.error === "string"
          ? data.error
          : "") ||
        `HTTP ${response.status}`;

      console.error("Gemini API Error:", {
        status: response.status,
        error: googleError,
      });

      return res.status(response.status).json({
        error: googleError,

        details: {
          provider: "Gemini",
          model,
          status: response.status,
        },
      });
    }

    // Extract generated text
    const text =
      (
        data?.candidates?.[0]?.content?.parts || []
      )
        .map((part) => part?.text || "")
        .join("")
        .trim();

    if (!text) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(data)
      );

      return res.status(502).json({
        error:
          "Gemini استجاب للطلب لكنه لم يُرجع نصًا.",

        details: {
          provider: "Gemini",
          model,
          finishReason:
            data?.candidates?.[0]?.finishReason ||
            null,
        },
      });
    }

    // Success
    return res.status(200).json({
      text,
    });

  } catch (error) {
    console.error(
      "Gemini Server Error:",
      error
    );

    return res.status(500).json({
      error:
        "حدث خطأ أثناء الاتصال بـ Gemini",

      details:
        error?.message ||
        String(error),
    });
  }
}
