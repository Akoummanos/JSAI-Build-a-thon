import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getImageData(imagePath) {
  const image = fs.readFileSync(imagePath);
  const imageBase64 = image.toString("base64");
  return {
    data: imageBase64,
    mime_type: "image/jpeg",
    name: path.basename(imagePath),
  };
}

export async function main() {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  //   get the image contoso_layout.png from the current directory
  const imagePath = path.join(__dirname, "contoso_layout_sketch.jpg");
  const imageData = getImageData(imagePath);


  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a helpful assistant helping me create a web page, in a hackathon" },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write a web page for a hackathon project that uses the following image as a layout sketch. Provide the HTML and CSS code with every image/icon included from cloud.",
            },

            {
              type: "image_url",
              image_url: {
                url: `data:${imageData.mime_type};base64,${imageData.data}`,
              },
            },
          ],
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {

  console.error("The sample encountered an error:", err);
});
