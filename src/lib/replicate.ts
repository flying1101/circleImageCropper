import Replicate from "replicate";
import fs from "node:fs";
import fetch from "node-fetch"; // 需安装 node-fetch

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function blurImage({
  imageUrl,
  denoising = 0.75,
  steps = 20,
  positivePrompt = "blur image",
}: {
  imageUrl: string;
  denoising?: number;
  steps?: number;
  positivePrompt?: string;
}) {
  try {
    const output = await replicate.run(
      "bxclib2/flux_img2img:0ce45202d83c6bd379dfe58f4c0c41e6cadf93ebbd9d938cc63cc0f2fcb729a5",
      {
        input: {
          seed: 0,
          image: imageUrl,
          steps,
          denoising,
          scheduler: "simple",
          sampler_name: "euler",
          positive_prompt: positivePrompt,
        },
      }
    );

    // output 可能是数组或字符串，需根据实际返回结构处理
    const resultUrl = Array.isArray(output) ? output[0] : output;
    // 下载图片并保存
    const res = await fetch(resultUrl);
    const buffer = await res.buffer();
    fs.writeFileSync("my-image.png", buffer);

    // 返回图片 URL 或 Buffer
    return resultUrl;
  } catch (err) {
    console.error("图片处理失败:", err);
    throw err;
  }
}
