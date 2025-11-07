import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const prompt = formData.get("prompt") as string;
        const file = formData.get("image") as File | null;

        let imagePart = [];
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            imagePart.push({
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: file.type,
                },
            });
        }

        const result = await model.generateContent([
            prompt,
            ...imagePart,
        ]);

        const text = result.response.text();
        return NextResponse.json({ text });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
